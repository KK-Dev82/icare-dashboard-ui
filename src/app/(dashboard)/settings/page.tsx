"use client";

import { useState } from "react";
import { usePermissions } from "@/contexts/PermissionContext";
import { ContactCategorySettingsPanel } from "./components/ContactCategorySettingsPanel";
import { NotificationSettingsPanel } from "./components/NotificationSettingsPanel";
import { RenewalContactSettingsPanel } from "./components/RenewalContactSettingsPanel";
import { SettingsTabs, type SettingTab } from "./components/SettingsTabs";
import { SystemSettingsPanel } from "./components/SystemSettingsPanel";

export default function SettingsPage() {
  const { hasPermission } = usePermissions();
  const canManageContactCategories = hasPermission("CONTACT_CASE");
  const [activeTab, setActiveTab] = useState<SettingTab>("system");
  const visibleActiveTab =
    activeTab === "contact" && !canManageContactCategories
      ? "system"
      : activeTab;

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="h-fit rounded-[18px] bg-white px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:sticky lg:top-[104px]">
        <div className="border-b border-[#EAEAEA] pb-4">
          <h1 className="text-lg font-bold text-[#243333]">การตั้งค่าระบบ</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">ตั้งค่าการใช้งานได้ในที่เดียว</p>
        </div>

        <SettingsTabs
          activeTab={visibleActiveTab}
          onChange={setActiveTab}
          showContactTab={canManageContactCategories}
        />
      </section>

      <div className="min-w-0">
        {visibleActiveTab === "system" && (
          <div className="flex flex-col gap-6">
            <SystemSettingsPanel />
            <RenewalContactSettingsPanel />
          </div>
        )}
        {visibleActiveTab === "contact" && canManageContactCategories && (
          <ContactCategorySettingsPanel />
        )}
        {visibleActiveTab === "notification" && <NotificationSettingsPanel />}
      </div>
    </div>
  );
}
