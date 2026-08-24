"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  NotificationPreviewCard,
  type NotificationPreviewContent,
} from "@/components/notification/NotificationPreviewCard";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { notificationApi } from "@/api/notification";
import type { NotificationAudience, NotificationType } from "@/api/notification";

export interface NotificationSendSource {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  mainImage?: string | null;
  bannerImage?: string | null;
  expiredAt?: string | null;
  category?: { name: string };
}

interface NotificationSendModalProps {
  open: boolean;
  source: NotificationSendSource | null;
  type: "news" | "product";
  onClose: () => void;
}

const recipientOptions: Array<{ label: string; value: NotificationAudience }> = [
  { label: "สมาชิกทั้งหมด", value: "ALL" },
  { label: "สมาชิก (MEMBER)", value: "MEMBER" },
  { label: "ลูกค้า (CUSTOMER)", value: "CUSTOMER" },
];

const deliveryOptions = [
  { label: "เผยแพร่ทันที", value: "immediate" },
  { label: "ตั้งเวลาส่ง", value: "scheduled" },
];

export function NotificationSendModal({
  open,
  source,
  type,
  onClose,
}: NotificationSendModalProps) {
  const toast = useToast();
  const [recipientGroup, setRecipientGroup] = useState<NotificationAudience>("ALL");
  const [delivery, setDelivery] = useState("immediate");
  const [sending, setSending] = useState(false);

  const previewContent = useMemo<NotificationPreviewContent | undefined>(() => {
    if (!source) return undefined;

    const isProduct = type === "product";
    const categoryName = source.category?.name?.trim();
    const normalizedCategory = categoryName?.toLocaleLowerCase() ?? "";
    const isPromotion =
      type === "news" &&
      (normalizedCategory.includes("โปรโม") ||
        normalizedCategory.includes("promotion") ||
        normalizedCategory.includes("promo"));
    const image = isPromotion
      ? source.bannerImage || source.mainImage || undefined
      : source.mainImage || source.bannerImage || undefined;
    const contentDetails = extractContentLines(source.content);

    if (isPromotion) {
      const promotionDetails: Array<{ text: string }> = [];

      if (contentDetails[0]) {
        promotionDetails.push({ text: contentDetails[0] });
      }

      if (source.expiredAt) {
        promotionDetails.push({ text: `ถึง ${formatThaiDate(source.expiredAt)}` });
      } else if (contentDetails[1]) {
        promotionDetails.push({ text: contentDetails[1] });
      }

      return {
        title: "🎁 โปรโมชั่นใหม่สำหรับคุณ",
        reference: source.summary || source.title,
        image,
        imageAlt: source.title,
        details: promotionDetails.length > 0 ? promotionDetails : undefined,
      };
    }

    if (!isProduct) {
      return {
        title: "📰 ข่าวสารจาก ICI Insurance",
        message:
          source.summary || contentDetails.join(" ") || source.title,
        image,
        imageAlt: source.title,
      };
    }

    return {
      title: "📦 ผลิตภัณฑ์แนะนำสำหรับคุณ",
      reference: source.title,
      message: source.summary || undefined,
      image,
      imageAlt: source.title,
      imageBadge: categoryName,
      details:
        contentDetails.length > 0
          ? contentDetails.map((text) => ({ text }))
          : undefined,
    };
  }, [source, type]);

  if (!open || !source || !previewContent) return null;

  const resetForm = () => {
    setRecipientGroup("ALL");
    setDelivery("immediate");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!source || !previewContent) return;
    setSending(true);
    try {
      const notifType: NotificationType = type === "product" ? "POLICY" : "NEWS";
      let body: string;
      if (type === "product") {
        const details = source.summary;
        body = details ? `${source.title}\n${details}` : source.title;
      } else {
        const summary = previewContent.message || previewContent.reference || source.summary || source.title;
        const details = previewContent.details?.map((d) => d.text).join("\n");
        body = details ? `${summary}\n─────────────────\n${details}` : summary;
      }
      const result = await notificationApi.broadcast({
        title: previewContent.title,
        body,
        type: notifType,
        audience: recipientGroup,
        contentId: type === "news" ? source.id : undefined,
        productId: type === "product" ? source.id : undefined,
        imageUrl: typeof previewContent.image === "string" ? previewContent.image : undefined,
      });
      if ("scheduled" in result) {
        toast.success("ตั้งเวลาส่งสำเร็จ");
      } else {
        toast.success("ส่ง notification สำเร็จ");
      }
      handleClose();
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto px-4 py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="fixed inset-0 bg-black/25"
        onClick={handleClose}
      />

      <div className="relative my-auto w-full max-w-[760px] rounded-[20px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={handleClose}
          aria-label="ปิด"
          className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
        >
          <X size={14} strokeWidth={3} />
        </button>

        <div className="px-7 py-5 sm:px-9">
          <header className="border-b border-[#EAEAEA] pb-4 pr-10">
            <h2
              id="notification-modal-title"
              className="text-[20px] font-bold leading-7 text-[#243333]"
            >
              สร้างการแจ้งเตือน
            </h2>
            <p className="mt-0.5 text-[14px] text-[#B0B6B8]">
              สร้างการแจ้งเตือนไปให้ผู้ใช้งาน
            </p>
          </header>

          <section className="grid gap-6 border-b border-[#EAEAEA] py-5 sm:grid-cols-2 sm:gap-8">
            <PreviewColumn label="แบบย่อ">
              <NotificationPreviewCard
                platform="android"
                content={previewContent}
                variant="compact"
                expandToContent
              />
            </PreviewColumn>

            <PreviewColumn label="แบบขยาย">
              <NotificationPreviewCard
                platform="android"
                content={previewContent}
                variant="expanded"
                expandToContent
              />
            </PreviewColumn>
          </section>

          <section className="pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                size="md"
                className="w-full"
                label="กลุ่มผู้รับ"
                value={recipientGroup}
                onChange={(v) => setRecipientGroup(v as NotificationAudience)}
                options={recipientOptions}
                placement="top"
              />
              <Select
                size="md"
                className="w-full"
                label="การส่ง"
                value={delivery}
                onChange={setDelivery}
                options={deliveryOptions}
                placement="top"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={sending}
                className="h-[42px] min-w-[150px] rounded-[6px] bg-[#24A148] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1E8E3E] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "กำลังส่ง..." : "สร้างแจ้งเตือน"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="h-[42px] min-w-[150px] rounded-[6px] bg-[#D5D5D5] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#C5C5C5]"
              >
                รีเซ็ตแบบฟอร์ม
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function formatThaiDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extractContentLines(content?: string | null) {
  if (!content) return [];

  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function PreviewColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div>{children}</div>
      <p className="mt-3 text-center text-[14px] text-[#9CA3AF]">{label}</p>
    </div>
  );
}
