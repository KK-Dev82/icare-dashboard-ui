import { SquarePen } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/upload";
import type { NewsPromotionSettingItem } from "@/types/settings";

type NewsPromotionSettingsPanelItem = Pick<NewsPromotionSettingItem, "id" | "label" | "value">;

const contentSettings = [
  { id: 1, label: "ประเภท", value: "ข่าวสาร" },
  { id: 2, label: "ประเภท", value: "ประกาศ" },
];

interface NewsPromotionSettingsPanelProps {
  contentSettings?: NewsPromotionSettingsPanelItem[];
}

export function NewsPromotionSettingsPanel({
  contentSettings: items = contentSettings,
}: NewsPromotionSettingsPanelProps) {
  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
        <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าข่าวสารและโปรโมชั่น</h2>
        <button
          type="button"
          className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e]"
        >
          บันทึก
        </button>
      </div>

      <div className="space-y-7">
        {items.map((item) => (
          <div key={item.id} className="space-y-4 border-b border-[#EAEAEA] pb-7 last:border-b-0 last:pb-0">
            <div className="grid grid-cols-[40px_1fr_39px] items-center gap-3">
              <div className="flex h-[39px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-sm text-[#707070]">
                {item.id}
              </div>
              <Input size="md" className="w-full" label={item.label} value={item.value} readOnly />
              <ActionIconButton
                icon={SquarePen}
                variant="accent"
                className="h-[39px] w-[39px] rounded-[6px]"
                iconSize={16}
              />
            </div>

            <ImageUpload variant="settings-row" label="ภาพแบนเนอร์" powerTone="danger" />
          </div>
        ))}
      </div>
    </section>
  );
}
