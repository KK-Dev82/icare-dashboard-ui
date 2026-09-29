"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { notificationApi } from "@/api/notification";
import { memberApi } from "@/api/member";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Member } from "@/types/member";

const TEST_NOTIFICATION_TITLE = "แจ้งเตือน";
const MEMBER_SEARCH_LIMIT = 10;
const MEMBER_SEARCH_DEBOUNCE_MS = 300;

function useMemberSearch(keyword: string, enabled: boolean) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await memberApi.getAll({
          keyword: keyword.trim() || undefined,
          limit: MEMBER_SEARCH_LIMIT,
        });
        if (!cancelled) setMembers(res.data);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, MEMBER_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [keyword, enabled]);

  return { members, loading };
}

function toPhoneOption(member: Member): ComboboxOption {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ");
  // The list endpoint may omit devices; only show the badge when we actually know.
  const hasPushDevice = member.devices?.some((device) => device.isActive && device.fcmToken);

  return {
    value: member.phone,
    label: member.phone,
    description: fullName || undefined,
    badge:
      hasPushDevice === undefined ? undefined : (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            hasPushDevice ? "bg-[#E5F8F8] text-[#07A2A2]" : "bg-[#F3F4F6] text-[#9CA3AF]"
          }`}
        >
          {hasPushDevice ? "มีอุปกรณ์" : "ไม่มีอุปกรณ์"}
        </span>
      ),
  };
}

export function PushNotificationTestPanel() {
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const canSearchMembers = hasPermission("MEMBERS");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  // Don't hit the members API until the admin actually opens the phone field.
  const [phoneFieldTouched, setPhoneFieldTouched] = useState(false);
  const { members, loading: searchingMembers } = useMemberSearch(
    phone,
    canSearchMembers && phoneFieldTouched,
  );

  const resetForm = () => {
    setPhone("");
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedPhone) {
      toast.warning("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    if (!trimmedMessage) {
      toast.warning("กรุณากรอกข้อความที่ต้องการใช้ทดสอบ");
      return;
    }

    setSending(true);
    try {
      const { total, success, failed } = await notificationApi.sendToPhone({
        phone: trimmedPhone,
        title: TEST_NOTIFICATION_TITLE,
        body: trimmedMessage,
        type: "SYSTEM",
      });

      if (total === 0) {
        toast.warning("ไม่พบอุปกรณ์ที่รับ Push ได้ (ไม่มี FCM Token)");
      } else if (success === 0) {
        toast.error(`ส่งไม่สำเร็จ (${failed}/${total} อุปกรณ์)`);
      } else if (failed > 0) {
        toast.warning(`ส่งสำเร็จ ${success}/${total} อุปกรณ์`);
      } else {
        toast.success(`ส่ง Push Notification ทดสอบสำเร็จ (${success} อุปกรณ์)`);
      }
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSending(false);
    }
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
          {canSearchMembers ? (
            <Combobox
              id="push-test-phone"
              inputMode="tel"
              size="md"
              className="w-full"
              label="กรอกเบอร์โทรศัพท์"
              placeholder="ค้นหาเบอร์หรือชื่อสมาชิก"
              emptyText="ไม่พบสมาชิก สามารถพิมพ์เบอร์เองได้"
              value={phone}
              onChange={setPhone}
              onFocus={() => setPhoneFieldTouched(true)}
              options={members.map(toPhoneOption)}
              loading={searchingMembers}
            />
          ) : (
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
          )}

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
            disabled={sending}
            className="h-[42px] w-full rounded-[6px] bg-[#24A148] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1E8E3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "กำลังส่ง..." : "ส่งคำทดสอบ"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={sending}
            className="h-[42px] w-full rounded-[6px] bg-[#D5D5D5] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#C5C5C5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            รีเซ็ตฟอร์ม
          </button>
        </div>
      </form>
    </section>
  );
}
