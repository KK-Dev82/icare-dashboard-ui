import { CirclePlus, Power, SquarePen } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/upload";
import type { PolicyTypeSettingItem } from "@/types/settings";

type PolicyTypeSettingsPanelItem = Pick<PolicyTypeSettingItem, "id" | "name">;

const policyTypes = [
  { id: 1, name: "ประกันอุบัติเหตุ" },
  { id: 3, name: "ประกันเกี่ยวกับทรัพย์สิน" },
  { id: 3, name: "ประกันภัยเดินทาง" },
];

interface PolicyTypeSettingsPanelProps {
  policyTypes?: PolicyTypeSettingsPanelItem[];
}

export function PolicyTypeSettingsPanel({
  policyTypes: items = policyTypes,
}: PolicyTypeSettingsPanelProps) {
  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <PanelHeader title="การตั้งค่าประเภทประกัน" />

      <div className="space-y-7">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="space-y-4 border-b border-[#EAEAEA] pb-7 last:border-b-0"
          >
            <div className="grid grid-cols-[40px_1fr_39px_39px] items-center gap-3">
              <IndexBadge value={item.id} />
              <Input size="md" className="w-full" label="ประเภท" value={item.name} readOnly />
              <ActionIconButton
                icon={SquarePen}
                variant="accent"
                className="h-[39px] w-[39px] rounded-[6px]"
                iconSize={16}
              />
              <ActionIconButton
                icon={Power}
                variant="danger"
                className="h-[39px] w-[39px] rounded-[6px]"
                iconSize={16}
                iconStrokeWidth={3}
              />
            </div>

            <ImageUpload variant="settings-row" label="ภาพแบนเนอร์" />
            <ImageUpload variant="settings-row" label="ภาพไอคอน" />
          </div>
        ))}
      </div>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          className="flex h-[39px] items-center justify-center gap-2 rounded-[6px] bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <CirclePlus size={16} />
          เพิ่มประเภทประกัน
        </button>
      </div>
    </section>
  );
}

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
      <h2 className="text-lg font-bold text-[#243333]">{title}</h2>
      <button
        type="button"
        className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e]"
      >
        บันทึก
      </button>
    </div>
  );
}

function IndexBadge({ value }: { value: number }) {
  return (
    <div className="flex h-[39px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-sm text-[#707070]">
      {value}
    </div>
  );
}
