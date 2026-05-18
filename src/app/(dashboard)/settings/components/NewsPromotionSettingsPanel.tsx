"use client";

import { useEffect, useState } from "react";
import { CirclePlus, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/upload";
import { contentCategoryApi } from "@/api/content-category";
import type { ContentCategory } from "@/types/content-category";

interface LocalItem {
  id: string;
  name: string;
  bannerImage: string;
  isActive: boolean;
  isNew?: boolean;
  isDirty?: boolean;
}

function toLocal(item: ContentCategory): LocalItem {
  return {
    id: item.id,
    name: item.name,
    bannerImage: item.bannerImage || "",
    isActive: item.isActive,
    isNew: false,
    isDirty: false,
  };
}

export function NewsPromotionSettingsPanel() {
  const [items, setItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await contentCategoryApi.getAll();
    if (res.success) setItems(res.data.map(toLocal));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateItem = (index: number, field: keyof LocalItem, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, isDirty: true } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        bannerImage: "",
        isActive: true,
        isNew: true,
        isDirty: true,
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of items) {
        if (!item.isDirty) continue;
        const payload = {
          name: item.name,
          bannerImage: item.bannerImage || undefined,
        };
        if (item.isNew) {
          if (!item.name.trim()) continue;
          await contentCategoryApi.create(payload);
        } else {
          await contentCategoryApi.update(item.id, payload);
        }
      }
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (index: number) => {
    const item = items[index];
    if (item.isNew) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    await contentCategoryApi.delete(item.id);
    fetchData();
  };

  const hasDirty = items.some((item) => item.isDirty);

  if (loading) {
    return (
      <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="space-y-7 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4 border-b border-[#EAEAEA] pb-7">
              <div className="h-[39px] bg-gray-100 rounded-lg" />
              <div className="h-[68px] bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
        <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าข่าวสารและโปรโมชั่น</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasDirty}
          className="h-[39px] min-w-[145px] rounded-[6px] bg-[#24A148] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1e8e3e] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      <div className="space-y-7">
        {items.map((item, index) => (
          <div key={item.id} className="space-y-4 border-b border-[#EAEAEA] pb-7 last:border-b-0 last:pb-0">
            <div className="grid grid-cols-[40px_1fr_39px] items-center gap-3">
              <div className="flex h-[39px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-sm text-[#707070]">
                {index + 1}
              </div>
              <Input
                size="md"
                className="w-full"
                label="ประเภท"
                placeholder="กรอกชื่อประเภท"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className={`h-[39px] w-[39px] flex items-center justify-center rounded-[6px] text-white transition-colors ${
                  item.isActive ? "bg-[#F44034] hover:bg-[#F44034]/85" : "bg-[#24A148] hover:bg-[#24A148]/85"
                }`}
              >
                <Power size={16} strokeWidth={3} />
              </button>
            </div>

            <ImageUpload
              variant="settings-row"
              label="ภาพแบนเนอร์"
              value={item.bannerImage}
              onChange={(url) => updateItem(index, "bannerImage", url)}
            />
          </div>
        ))}
      </div>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={addItem}
          className="flex h-[39px] items-center justify-center gap-2 rounded-[6px] bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <CirclePlus size={16} />
          เพิ่มประเภทเนื้อหา
        </button>
      </div>
    </section>
  );
}
