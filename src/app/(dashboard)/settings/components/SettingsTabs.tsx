export type SettingTab =
  | "system"
  | "content"
  | "contact"
  | "consent"
  | "notification";

interface SettingsTabsProps {
  activeTab: SettingTab;
  onChange: (tab: SettingTab) => void;
}

const tabs: Array<{ label: string; value: SettingTab }> = [
  { label: "การตั้งค่าระบบ", value: "system" },
  { label: "การตั้งค่าข่าวสาร / โปรโมชั่น", value: "content" },
  { label: "การตั้งค่าหัวข้อการติดต่อ", value: "contact" },
  { label: "การตั้งค่าประเภท Consent", value: "consent" },
  { label: "ตั้งค่าการแจ้งเตือนกรมธรรม์", value: "notification" },
];

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={isActive}
            className={`min-h-[44px] w-full rounded-[6px] border px-4 py-2 text-left text-sm font-medium leading-5 transition-colors ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-[#D6EEEE] bg-white text-primary hover:border-primary hover:bg-primary/5"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
