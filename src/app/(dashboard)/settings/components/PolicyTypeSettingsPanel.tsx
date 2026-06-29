"use client";

import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Power, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/upload";
import { policyCategoryApi } from "@/api/policy-category";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { PolicyCategory } from "@/types/policy-category";

export function PolicyTypeSettingsPanel() {
  const toast = useToast();
  const [items, setItems] = useState<PolicyCategory[]>([]);
  const [confirmItem, setConfirmItem] = useState<PolicyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PolicyCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBanner, setFormBanner] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formTagColor, setFormTagColor] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await policyCategoryApi.getAll();
      if (res.success) setItems(sortPolicyCategories(res.data));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setFormName("");
    setFormDesc("");
    setFormBanner("");
    setFormIcon("");
    setFormTagColor("");
    setShowForm(true);
  };

  const openEdit = (item: PolicyCategory) => {
    setEditItem(item);
    setFormName(item.name);
    setFormDesc(item.description || "");
    setFormBanner(item.bannerImage || "");
    setFormIcon(item.icon || "");
    setFormTagColor(item.tagColor || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    const payload = {
      name: formName,
      description: formDesc || undefined,
      bannerImage: formBanner || undefined,
      icon: formIcon || undefined,
      tagColor: formTagColor || undefined,
    };
    try {
      if (editItem) {
        await policyCategoryApi.update(editItem.id, payload);
        toast.success("แก้ไขประเภทผลิตภัณฑ์สำเร็จ");
      } else {
        await policyCategoryApi.create(payload);
        toast.success("เพิ่มประเภทผลิตภัณฑ์สำเร็จ");
      }
      closeForm();
      fetchData();
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClick = (item: PolicyCategory) => {
    setConfirmItem(item);
  };

  const handleToggle = async (item: PolicyCategory) => {
    const isActive = item.isActive !== false;
    setUpdatingId(item.id);
    setErrorMessage(null);

    try {
      const res = isActive
        ? await policyCategoryApi.delete(item.id)
        : await policyCategoryApi.update(item.id, { isActive: true });

      if (!res.success) {
        toast.error(res.message || "อัปเดตสถานะไม่สำเร็จ");
        return;
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, ...res.data, isActive: !isActive }
            : currentItem,
        ),
      );
      toast.success(isActive ? "ปิดการใช้งานสำเร็จ" : "เปิดการใช้งานสำเร็จ");
    } catch (err) {
      toast.fromError(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-[#EAEAEA] pb-5">
        <h2 className="text-lg font-bold text-[#243333]">การตั้งค่าผลิตภัณฑ์</h2>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[52px] bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={fetchData} />
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9CA3AF]">ยังไม่มีประเภทผลิตภัณฑ์</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isActive = item.isActive !== false;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[10px] border border-[#EAEAEA] px-4 py-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#DCDCDC] text-xs text-[#707070]">
                  {index + 1}
                </div>
                {item.icon && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.icon} alt={item.name} className="w-9 h-9 rounded-md object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#243333] truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-[#9CA3AF] truncate">{item.description}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-[#24A148]" : "text-[#F44034]"}`}>
                  {isActive ? "เปิด" : "ปิด"}
                </span>
                <button
                  onClick={() => openEdit(item)}
                  disabled={isUpdating}
                  className="h-[32px] w-[32px] flex items-center justify-center rounded-[6px] bg-[#FF944D] text-white hover:bg-[#FF944D]/85 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleToggleClick(item)}
                  disabled={isUpdating}
                  className={`h-[32px] w-[32px] flex items-center justify-center rounded-[6px] text-white transition-colors ${
                    isActive ? "bg-[#F44034] hover:bg-[#F44034]/85" : "bg-[#24A148] hover:bg-[#24A148]/85"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <Power size={14} strokeWidth={3} />
                </button>
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
          เพิ่มประเภทประกัน
        </button>
      </div>

      <ConfirmModal
        open={Boolean(confirmItem)}
        title={confirmItem?.isActive !== false ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        message={`ต้องการ${confirmItem?.isActive !== false ? "ปิด" : "เปิด"}การใช้งาน "${confirmItem?.name}" ใช่หรือไม่?`}
        confirmLabel={confirmItem?.isActive !== false ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        confirmColor={confirmItem?.isActive !== false ? "danger" : "success"}
        onConfirm={() => { handleToggle(confirmItem!); setConfirmItem(null); }}
        onCancel={() => setConfirmItem(null)}
      />

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeForm} />
          <div className="relative bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 w-full max-w-[480px] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#243333]">
                {editItem ? "แก้ไขประเภทผลิตภัณฑ์" : "เพิ่มประเภทผลิตภัณฑ์"}
              </h2>
              <button onClick={closeForm} className="text-[#9CA3AF] hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <Input
                size="lg"
                className="w-full"
                label="ชื่อประเภท *"
                placeholder="กรอกชื่อประเภท"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                size="lg"
                className="w-full"
                label="คำอธิบาย"
                placeholder="กรอกคำอธิบาย"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
              <div>
                <label className="block text-[14px] font-bold text-dark mb-2">สี Tag</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formTagColor || "#07A2A2"}
                    onChange={(e) => setFormTagColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#DCDCDC] cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#FF5733"
                    value={formTagColor}
                    onChange={(e) => setFormTagColor(e.target.value)}
                    className="h-10 flex-1 rounded-[10px] border border-[#DCDCDC] px-4 text-sm text-[#565656] outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <p className="text-[14px] font-bold text-dark mb-2">ภาพไอคอน</p>
                <ImageUpload value={formIcon} onChange={setFormIcon} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-dark mb-2">ภาพแบนเนอร์</p>
                <ImageUpload value={formBanner} onChange={setFormBanner} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeForm}
                className="h-[40px] px-5 rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="h-[40px] px-5 rounded-[10px] bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

function sortPolicyCategories(items: PolicyCategory[]) {
  return [...items].sort((a, b) => {
    const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (createdAtDiff !== 0) return createdAtDiff;
    return a.id.localeCompare(b.id);
  });
}
