export type SettingTab = "system" | "policy" | "content" | "contact";

interface SettingsTabsProps {
  activeTab: SettingTab;
  onChange: (tab: SettingTab) => void;
}

const tabs: Array<{ label: string; value: SettingTab }> = [
  { label: "การตั้งค่าระบบ", value: "system" },
  { label: "การตั้งค่าผลิตภัณฑ์", value: "policy" },
  { label: "การตั้งค่าข่าวสาร / โปรโมชั่น", value: "content" },
  { label: "การตั้งค่าหัวข้อการติดต่อ", value: "contact" },
];

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`h-[39px] rounded-[6px] border px-4 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-primary text-primary hover:bg-primary/5"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
