"use client";

import { useState } from "react";
import { ContactCategorySettingsPanel } from "./components/ContactCategorySettingsPanel";
import { NewsPromotionSettingsPanel } from "./components/NewsPromotionSettingsPanel";
import { PolicyTypeSettingsPanel } from "./components/PolicyTypeSettingsPanel";
import { SettingsTabs, type SettingTab } from "./components/SettingsTabs";
import { SystemSettingsPanel } from "./components/SystemSettingsPanel";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("system");

  return (
    <div className="mx-auto w-full max-w-[654px] space-y-6">
      <section className="rounded-[18px] bg-white px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#EAEAEA] pb-4">
          <h1 className="text-lg font-bold text-[#243333]">การตั้งค่าระบบ</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">ตั้งค่าการใช้งานได้ในที่เดียว</p>
        </div>

        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </section>

      {activeTab === "system" && <SystemSettingsPanel />}
      {activeTab === "policy" && <PolicyTypeSettingsPanel />}
      {activeTab === "content" && <NewsPromotionSettingsPanel />}
      {activeTab === "contact" && <ContactCategorySettingsPanel />}
    </div>
  );
}
