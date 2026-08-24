"use client";

import { useState } from "react";
import {
  NotificationPreviewCard,
  type NotificationPreviewContent,
  type NotificationPreviewPlatform,
} from "@/components/notification/NotificationPreviewCard";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { notificationApi } from "@/api/notification";
import type { NotificationAudience } from "@/api/notification";

const initialTitle = "⚠️ แจ้งปิดปรับปรุงระบบชั่วคราว";
const initialDescription = "15 ส.ค. 2569 เวลา 01:00–03:00 น.";

const previewPlatforms: Array<{
  platform: NotificationPreviewPlatform;
  label: string;
}> = [
  { platform: "android", label: "Android - แจ้งเตือนระบบ" },
  { platform: "ios", label: "iPhone - แจ้งเตือนระบบ" },
  { platform: "in-app", label: "แบนเนอร์ในแอป - แจ้งเตือนระบบ" },
];

export function EmergencyMessagePanel() {
  const toast = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [recipientGroup, setRecipientGroup] = useState<NotificationAudience>("ALL");
  const [sending, setSending] = useState(false);

  const previewContent: NotificationPreviewContent = {
    title: title.trim() || "⚠️ หัวข้อข้อความฉุกเฉิน",
    reference: description.trim() || "รายละเอียดข้อความฉุกเฉิน",
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRecipientGroup("ALL");
  };

  const sendMessage = async () => {
    if (!title.trim() || !description.trim()) {
      toast.warning("กรุณากรอกหัวข้อและคำอธิบายให้ครบถ้วน");
      return;
    }
    setSending(true);
    try {
      const result = await notificationApi.broadcast({
        title: title.trim(),
        body: description.trim(),
        type: "SYSTEM",
        audience: recipientGroup,
      });
      if ("scheduled" in result) {
        toast.success("ตั้งเวลาส่งสำเร็จ");
      } else {
        toast.success("ส่งข้อความฉุกเฉินสำเร็จ");
      }
      resetForm();
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-8 border-b border-[#EAEAEA] pb-5">
          <h2 className="text-[20px] font-bold leading-7 text-[#243333]">ส่งข้อความฉุกเฉิน</h2>
          <p className="mt-1 max-w-[620px] text-[14px] leading-6 text-[#9CA3AF]">
            ใช้สำหรับส่งข้อความแจ้งเตือนเร่งด่วนไปยังผู้ใช้งานแอปพลิเคชัน เช่น แจ้งปิดปรับปรุง หรือแจ้งเหตุขัดข้อง
          </p>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-[#243333]">
              หัวข้อ
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="กรอกหัวข้อข้อความฉุกเฉิน"
              className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] bg-white px-4 text-[14px] text-[#565656] outline-none transition-all placeholder:text-[#B7B7B7] hover:border-primary focus:border-primary"
            />
          </div>

          <div>
            <div className="relative">
              <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-[#243333]">
                คำอธิบาย
              </label>
              <textarea
                rows={4}
                value={description}
                maxLength={500}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="กรอกรายละเอียดข้อความฉุกเฉิน"
                className="w-full resize-none rounded-[10px] border border-[#DCDCDC] bg-white px-4 py-4 text-[14px] leading-6 text-[#565656] outline-none transition-all placeholder:text-[#B7B7B7] hover:border-primary focus:border-primary"
              />
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[#B0B6B8]">
              ข้อความบรรทัดแรกควรเป็นใจความสำคัญ เนื่องจากบางอุปกรณ์อาจแสดงข้อความบางส่วน
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Select
              size="md"
              className="w-full md:max-w-[315px]"
              label="กลุ่มผู้รับ"
              value={recipientGroup}
              onChange={(v) => setRecipientGroup(v as NotificationAudience)}
              options={[
                { label: "สมาชิกทั้งหมด", value: "ALL" },
                { label: "สมาชิก (MEMBER)", value: "MEMBER" },
                { label: "ลูกค้า (CUSTOMER)", value: "CUSTOMER" },
              ]}
            />

            <div className="flex shrink-0 justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="h-[42px] min-w-[112px] rounded-[6px] border border-[#DCDCDC] bg-white px-5 text-[14px] font-medium text-[#565656] transition-colors hover:bg-gray-50"
              >
                รีเซ็ตฟอร์ม
              </button>
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={sending}
                className="h-[42px] min-w-[112px] rounded-[6px] bg-[#24A148] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1E8E3E] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "กำลังส่ง..." : "ส่งข้อความ"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="rounded-[18px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] xl:sticky xl:top-[104px]">
        <h2 className="text-[20px] font-bold leading-7 text-[#243333]">ตัวอย่างการแสดงผล</h2>

        <div className="mt-7 space-y-7">
          {previewPlatforms.map((item) => (
            <div key={item.platform}>
              <h3 className="mb-3 text-[16px] font-bold leading-6 text-[#111827]">
                {item.label}
              </h3>
              <NotificationPreviewCard
                platform={item.platform}
                content={previewContent}
                expandToContent
              />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
