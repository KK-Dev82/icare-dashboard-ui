"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { settingsApi } from "@/api/settings";
import { ErrorState } from "@/components/ui/error-state";
import type { SettingItem } from "@/types/settings";

const keyLabel: Record<string, string> = {
  contact_phone: "เบอร์ติดต่อ",
  contact_email: "อีเมล",
  business_hours: "เวลาเปิด - ปิด",
};

export function SystemSettingsPanel() {
  const [items, setItems] = useState<SettingItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setErrorMessage(null);
    settingsApi.getSettings().then((data) => {
      setItems(data);
      const values: Record<string, string> = {};
      data.forEach((item) => { values[item.key] = item.value; });
      setFormValues(values);
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

  const handleSave = async () => {
    setSaving(true);
    const settings = Object.entries(formValues).map(([key, value]) => ({ key, value }));
    await settingsApi.updateSettings({ settings });
    setSaving(false);
  };

  if (loading) {
    return (
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าระบบ</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.key} className="grid grid-cols-[40px_1fr] items-center gap-3">
            <div className="flex h-[39px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-sm text-[#707070]">
              {idx + 1}
            </div>
            <Input
              size="md"
              className="w-full"
              label={keyLabel[item.key] || item.description || undefined}
              value={formValues[item.key] || ""}
              onChange={(e) => setFormValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
