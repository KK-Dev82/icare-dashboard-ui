"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export function PushNotificationTestPanel() {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setPhone("");
    setMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phone.trim()) {
      toast.warning("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    if (!message.trim()) {
      toast.warning("กรุณากรอกข้อความที่ต้องการใช้ทดสอบ");
      return;
    }

    toast.info(
      "แบบฟอร์มพร้อมเชื่อมต่อเมื่อ API สำหรับส่ง Push Notification ทดสอบพร้อมใช้งาน",
      "รอเชื่อมต่อ API",
    );
  };

  return (
    <section className="rounded-[18px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#EAEAEA] pb-4">
        <h2 className="text-[20px] font-bold leading-7 text-[#243333]">
          Push Notification
        </h2>
        <p className="mt-1 text-[14px] leading-6 text-[#9CA3AF]">
          ทดสอบส่ง Push Notification รายบุคคล
        </p>
      </div>

      <form className="mt-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            id="push-test-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            size="md"
            className="w-full"
            label="กรอกเบอร์โทรศัพท์"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <Textarea
            id="push-test-message"
            size="md"
            className="w-full"
            label="กรอกข้อความที่ต้องการใช้ทดสอบ"
            placeholder="ข้อความนี้จะถูกส่งไปยังอุปกรณ์ของผู้ใช้ท่านนี้"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <p className="mt-2 text-[12px] leading-5 text-[#B0B6B8]">
          ระบบจะค้นหา FCM Token ที่ผูกกับเบอร์โทรศัพท์นี้
        </p>

        <div className="mt-4 grid gap-2">
          <button
            type="submit"
            className="h-[42px] w-full rounded-[6px] bg-[#24A148] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1E8E3E]"
          >
            ส่งคำทดสอบ
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="h-[42px] w-full rounded-[6px] bg-[#D5D5D5] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#C5C5C5]"
          >
            รีเซ็ตฟอร์ม
          </button>
        </div>
      </form>
    </section>
  );
}
