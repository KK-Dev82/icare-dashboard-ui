export type SettingTab =
  | "system"
  | "contact"
  | "notification";

interface SettingsTabsProps {
  activeTab: SettingTab;
  onChange: (tab: SettingTab) => void;
  showContactTab?: boolean;
}

const tabs: Array<{ label: string; value: SettingTab }> = [
  { label: "การตั้งค่าระบบ", value: "system" },
  { label: "การตั้งค่าหัวข้อการติดต่อ", value: "contact" },
  { label: "ตั้งค่าการแจ้งเตือนกรมธรรม์", value: "notification" },
];

export function SettingsTabs({
  activeTab,
  onChange,
  showContactTab = true,
}: SettingsTabsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {tabs.filter((tab) => showContactTab || tab.value !== "contact").map((tab) => {
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
