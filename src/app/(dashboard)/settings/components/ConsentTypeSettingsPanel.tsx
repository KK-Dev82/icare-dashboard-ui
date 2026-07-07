"use client";

import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Power, X } from "lucide-react";
import { consentApi } from "@/api/consent";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { ConsentType } from "@/types/consent";

export function ConsentTypeSettingsPanel() {
  const toast = useToast();
  const [items, setItems] = useState<ConsentType[]>([]);
  const [confirmItem, setConfirmItem] = useState<ConsentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ConsentType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await consentApi.getTypes();
      setItems(sortTypes(data));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreate = () => {
    const nextSortOrder =
      items.reduce((highest, item) => Math.max(highest, item.sortOrder ?? 0), 0) +
      1;

    setEditItem(null);
    setFormName("");
    setFormSlug("");
    setFormSortOrder(String(nextSortOrder));
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item: ConsentType) => {
    setEditItem(item);
    setFormName(item.name);
    setFormSlug(item.slug);
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
    const slug = formSlug.trim();
    const sortOrder = Number(formSortOrder);

    if (!name) {
      setFormError("กรุณาระบุชื่อประเภท");
      return;
    }
    if (!slug) {
      setFormError("กรุณาระบุ slug");
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
        await consentApi.updateType(editItem.id, {
          name,
          slug,
          sortOrder,
          isActive: editItem.isActive !== false,
        });
        toast.success("แก้ไขประเภท consent สำเร็จ");
      } else {
        await consentApi.createType({ name, slug });
        toast.success("เพิ่มประเภท consent สำเร็จ");
      }
      setShowForm(false);
      setEditItem(null);
      await fetchData();
    } catch (error) {
      toast.fromError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item: ConsentType) => {
    const isActive = item.isActive !== false;
    setUpdatingId(item.id);

    try {
      await consentApi.updateType(item.id, { isActive: !isActive });
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, isActive: !isActive }
            : currentItem,
        ),
      );
      toast.success(isActive ? "ปิดการใช้งานสำเร็จ" : "เปิดการใช้งานสำเร็จ");
    } catch (error) {
      toast.fromError(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
        <div>
          <h2 className="text-lg font-bold text-[#243333]">
            การตั้งค่าประเภท Consent
          </h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            จัดการประเภทสำหรับ dropdown ในหน้าความยินยอม / นโยบาย
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
          ยังไม่มีประเภท consent
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
                  <p className="truncate text-sm font-medium text-[#243333]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {item.slug} · ลำดับ {item.sortOrder ?? 0}
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
                  onClick={() => setConfirmItem(item)}
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
          เพิ่มประเภท Consent
        </button>
      </div>

      <ConfirmModal
        open={Boolean(confirmItem)}
        title={
          confirmItem?.isActive !== false ? "ปิดการใช้งาน" : "เปิดการใช้งาน"
        }
        message={`ต้องการ${confirmItem?.isActive !== false ? "ปิด" : "เปิด"}การใช้งาน "${confirmItem?.name}" ใช่หรือไม่?`}
        confirmLabel={
          confirmItem?.isActive !== false ? "ปิดการใช้งาน" : "เปิดการใช้งาน"
        }
        confirmColor={confirmItem?.isActive !== false ? "danger" : "success"}
        onConfirm={() => {
          void handleToggle(confirmItem!);
          setConfirmItem(null);
        }}
        onCancel={() => setConfirmItem(null)}
      />

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
                {editItem ? "แก้ไขประเภท Consent" : "เพิ่มประเภท Consent"}
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
                label="ชื่อประเภท *"
                placeholder="เช่น PDPA"
                value={formName}
                onChange={(event) => {
                  setFormName(event.target.value);
                  if (!editItem) setFormSlug(slugify(event.target.value));
                }}
                disabled={saving}
              />
              <Input
                size="lg"
                className="w-full"
                label="Slug *"
                placeholder="เช่น pdpa"
                value={formSlug}
                onChange={(event) => setFormSlug(slugify(event.target.value))}
                disabled={saving}
              />
              {editItem && (
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
              )}
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
                disabled={saving || !formName.trim() || !formSlug.trim()}
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

function sortTypes(items: ConsentType[]) {
  return [...items].sort((a, b) => {
    const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortDiff !== 0) return sortDiff;
    return a.name.localeCompare(b.name);
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
