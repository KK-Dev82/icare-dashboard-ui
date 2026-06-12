"use client";

import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Power, X } from "lucide-react";
import { contactCaseApi } from "@/api/contact-case";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import type { ContactCategory } from "@/types/contact-case";

export function ContactCategorySettingsPanel() {
  const [items, setItems] = useState<ContactCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ContactCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      setItems(await contactCaseApi.getCategories());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreate = () => {
    const nextSortOrder = items.reduce(
      (highest, item) => Math.max(highest, item.sortOrder ?? 0),
      0,
    ) + 1;

    setEditItem(null);
    setFormName("");
    setFormSortOrder(String(nextSortOrder));
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item: ContactCategory) => {
    setEditItem(item);
    setFormName(item.name);
    setFormSortOrder(String(item.sortOrder ?? 0));
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditItem(null);
    setFormError("");
  };

  const handleSave = async () => {
    const name = formName.trim();
    const sortOrder = Number(formSortOrder);

    if (!name) {
      setFormError("กรุณาระบุชื่อหัวข้อการติดต่อ");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError("ลำดับการแสดงผลต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editItem) {
        await contactCaseApi.updateCategory(editItem.id, { name, sortOrder });
      } else {
        await contactCaseApi.createCategory({ name, sortOrder });
      }
      setShowForm(false);
      setEditItem(null);
      await fetchData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: ContactCategory) => {
    setUpdatingId(item.id);
    setErrorMessage(null);

    try {
      if (item.isActive === false) {
        await contactCaseApi.updateCategory(item.id, { isActive: true });
      } else {
        await contactCaseApi.deleteCategory(item.id);
      }
      await fetchData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
        <div>
          <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าหัวข้อการติดต่อ</h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            จัดการหัวข้อที่แสดงในแบบฟอร์มติดต่อและคำร้อง
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[58px] rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : errorMessage && items.length === 0 ? (
        <ErrorState message={errorMessage} onRetry={fetchData} />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9CA3AF]">
          ยังไม่มีหัวข้อการติดต่อ
        </p>
      ) : (
        <div className="space-y-3">
          {errorMessage && (
            <div className="rounded-[8px] border border-[#F44034]/20 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
              {errorMessage}
            </div>
          )}

          {items.map((item, index) => {
            const isActive = item.isActive !== false;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[10px] border border-[#EAEAEA] px-4 py-3 transition-colors hover:border-primary/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#DCDCDC] text-xs text-[#707070]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#243333]">{item.name}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    ลำดับการแสดงผล {item.sortOrder ?? 0}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    isActive ? "text-[#24A148]" : "text-[#F44034]"
                  }`}
                >
                  {isActive ? "เปิด" : "ปิด"}
                </span>
                <ActionIconButton
                  icon={Pencil}
                  variant="accent"
                  aria-label={`แก้ไข ${item.name}`}
                  onClick={() => openEdit(item)}
                  disabled={isUpdating}
                />
                <ActionIconButton
                  icon={Power}
                  variant={isActive ? "danger" : "success"}
                  iconStrokeWidth={3}
                  aria-label={`${isActive ? "ปิด" : "เปิด"} ${item.name}`}
                  onClick={() => handleToggle(item)}
                  disabled={isUpdating}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={openCreate}
          className="flex h-[39px] items-center justify-center gap-2 rounded-[6px] bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <CirclePlus size={16} />
          เพิ่มหัวข้อการติดต่อ
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/30"
            onClick={closeForm}
            aria-label="ปิด"
          />
          <div className="relative w-full max-w-[480px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#243333]">
                {editItem ? "แก้ไขหัวข้อการติดต่อ" : "เพิ่มหัวข้อการติดต่อ"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="text-[#9CA3AF] transition-colors hover:text-gray-600 disabled:opacity-60"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <Input
                size="lg"
                className="w-full"
                label="ชื่อหัวข้อ *"
                placeholder="กรอกชื่อหัวข้อการติดต่อ"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                disabled={saving}
              />
              <Input
                size="lg"
                className="w-full"
                label="ลำดับการแสดงผล"
                type="number"
                min={0}
                step={1}
                value={formSortOrder}
                onChange={(event) => setFormSortOrder(event.target.value)}
                disabled={saving}
              />
              {formError && <p className="text-sm text-[#F44034]">{formError}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="h-10 rounded-[10px] border border-[#DCDCDC] px-5 text-sm font-medium text-[#565656] transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="h-10 rounded-[10px] bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
