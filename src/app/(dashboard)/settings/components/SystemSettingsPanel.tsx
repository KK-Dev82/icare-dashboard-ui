import { SquarePen } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import type { SystemSettingItem } from "@/types/settings";

const systemSettings = [
  {
    id: 1,
    label: "เบอร์ติดต่อ",
    value: "Ins 02-123-4567",
  },
  {
    id: 2,
    label: "อีเมล",
    value: "ici@icare-insurance.com",
  },
  {
    id: 3,
    label: "เวลาเปิด - ปิด",
    value: "จันทร์-ศุกร์ 8:30-17:30 น.",
  },
];

interface SystemSettingsPanelProps {
  settings?: SystemSettingItem[];
}

export function SystemSettingsPanel({ settings = systemSettings }: SystemSettingsPanelProps) {
  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าระบบ</h2>
        <button
          type="button"
          className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e]"
        >
          บันทึก
        </button>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="grid grid-cols-[40px_1fr_39px] items-center gap-3">
            <div className="flex h-[39px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-sm text-[#707070]">
              {setting.id}
            </div>
            <Input
              size="md"
              className="w-full"
              label={setting.label}
              value={setting.value}
              readOnly
            />
            <ActionIconButton
              icon={SquarePen}
              variant="accent"
              className="h-[39px] w-[39px] rounded-[6px]"
              iconSize={16}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
