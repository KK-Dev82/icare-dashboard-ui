"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { renewalContactApi } from "@/api/renewal-contact";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RenewalContactSettingsPanel() {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setErrorMessage(null);
    renewalContactApi.get().then((contact) => {
      const nextPhone = contact?.phone ?? "";
      const nextEmail = contact?.email ?? "";
      setPhone(nextPhone);
      setEmail(nextEmail);
      setInitialPhone(nextPhone);
      setInitialEmail(nextEmail);
    }).catch((err) => {
      setErrorMessage(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const isDirty = phone.trim() !== initialPhone || email.trim() !== initialEmail;

  const handleSaveClick = () => {
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setFormError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setFormError("");
    setConfirmSave(true);
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const contact = await renewalContactApi.save({
        phone: phone.trim(),
        email: email.trim(),
      });
      const nextPhone = contact.phone ?? "";
      const nextEmail = contact.email ?? "";
      setPhone(nextPhone);
      setEmail(nextEmail);
      setInitialPhone(nextPhone);
      setInitialEmail(nextEmail);
      toast.success("บันทึกการตั้งค่าติดต่อการต่ออายุกรมธรรม์สำเร็จ");
    } catch (error) {
      toast.fromError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[56px] bg-gray-100 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <ErrorState message={errorMessage} onRetry={fetchData} />
      </section>
    );
  }

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#243333]">ตั้งค่าติดต่อการต่ออายุกรมธรรม์</h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            กำหนดช่องทางการติดต่อสำหรับต่ออายุกรมธรรม์
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saving || !isDirty}
          className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      <div className="space-y-4">
        <Input
          size="md"
          className="w-full"
          label="เบอร์"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={saving}
        />
        <Input
          size="md"
          className="w-full"
          label="อีเมล"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
        />
        {formError && <p className="text-sm text-[#F44034]">{formError}</p>}
      </div>

      <ConfirmModal
        open={confirmSave}
        title="ยืนยันการบันทึก"
        message="ต้องการบันทึกการตั้งค่าติดต่อการต่ออายุกรมธรรม์ใช่หรือไม่?"
        confirmLabel="บันทึก"
        confirmColor="success"
        onConfirm={() => {
          setConfirmSave(false);
          void handleSave();
        }}
        onCancel={() => setConfirmSave(false)}
      />
    </section>
  );
}
