"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { notificationApi } from "@/api/notification";
import type { NotificationAudience, NotificationType } from "@/api/notification";

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: NotificationType;
  defaultTitle?: string;
  defaultBody?: string;
  contentId?: string;
  productId?: string;
  deepLink?: string;
  imageUrl?: string;
}

export function BroadcastModal({
  open,
  onClose,
  defaultType = "NEWS",
  defaultTitle = "",
  defaultBody = "",
  contentId,
  productId,
  deepLink,
  imageUrl,
}: BroadcastModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [type] = useState<NotificationType>(defaultType);
  const [audience, setAudience] = useState<NotificationAudience>("ALL");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const result = await notificationApi.broadcast({
        title: title.trim(),
        body: body.trim(),
        type,
        audience,
        contentId,
        productId,
        deepLink,
        imageUrl,
      });

      if ("scheduled" in result) {
        toast.success(`ตั้งเวลาส่งสำเร็จ`);
      } else {
        toast.success(`ส่ง notification สำเร็จ ${result.success}/${result.total} เครื่อง`);
      }
      onClose();
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-[480px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-[#243333]">ส่ง Notification</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#9CA3AF] hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            size="lg"
            className="w-full"
            label="หัวข้อ *"
            placeholder="กรอกหัวข้อ notification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="relative">
            <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[14px] font-bold text-dark">
              ข้อความ *
            </label>
            <textarea
              rows={3}
              placeholder="กรอกข้อความ notification"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-none rounded-[10px] border border-[#DCDCDC] px-4 py-3 text-sm text-[#565656] outline-none transition-colors hover:border-primary focus:border-primary"
            />
          </div>
          <Select
            size="lg"
            className="w-full"
            label="กลุ่มเป้าหมาย"
            value={audience}
            onChange={(v) => setAudience(v as NotificationAudience)}
            options={[
              { label: "ทุกคน (ALL)", value: "ALL" },
              { label: "สมาชิก (MEMBER)", value: "MEMBER" },
              { label: "ลูกค้า (CUSTOMER)", value: "CUSTOMER" },
            ]}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-5 rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            className="flex items-center gap-2 h-[40px] px-5 rounded-[10px] bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Bell size={15} />
            {sending ? "กำลังส่ง..." : "ส่ง Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
