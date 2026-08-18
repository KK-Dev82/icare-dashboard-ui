"use client";

import { useEffect, useMemo, useState } from "react";
import { CirclePlus, Power, SquarePen, X } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getTablePageItems,
  getTableTotalPages,
  TablePagination,
} from "@/components/ui/table-pagination";
import { ImageUpload } from "@/components/ui/upload";
import { policyCategoryApi } from "@/api/policy-category";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { PolicyCategory } from "@/types/policy-category";

const PAGE_SIZE = 10;

export function PolicyTypeSettingsPanel() {
  const toast = useToast();
  const [items, setItems] = useState<PolicyCategory[]>([]);
  const [confirmItem, setConfirmItem] = useState<PolicyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PolicyCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

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

  const filteredItems = useMemo(() => {
    const keyword = appliedSearch.toLowerCase();
    return items.filter((item) => {
      const status = item.isActive !== false ? "ACTIVE" : "INACTIVE";
      if (keyword && !item.name.toLowerCase().includes(keyword) && !(item.description || "").toLowerCase().includes(keyword)) return false;
      if (filterType && item.id !== filterType) return false;
      if (filterStatus && status !== filterStatus) return false;
      return true;
    });
  }, [appliedSearch, filterStatus, filterType, items]);

  const totalPages = getTableTotalPages(filteredItems.length, PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const visibleItems = getTablePageItems(filteredItems, currentPage, PAGE_SIZE);

  const handleSearch = () => {
    setAppliedSearch(search.trim());
    setPage(1);
  };

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
    <section className="flex min-h-[650px] w-full flex-col rounded-3xl border border-[#EAEAEA] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between border-b border-[#EAEAEA] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายการประเภทผลิตภัณฑ์</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">จัดการข้อมูลประเภทผลิตภัณฑ์</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#24A148] px-5 text-sm font-medium text-white transition-all hover:bg-[#1e8e3e] hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
        >
          <CirclePlus size={17} />
          เพิ่มประเภทผลิตภัณฑ์
        </button>
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-3">
        <Input
          size="md"
          className="w-[260px]"
          label="ค้นหา"
          placeholder="ค้นหาประเภทผลิตภัณฑ์"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
        />
        <Select
          size="md"
          className="w-[230px]"
          label="ประเภทผลิตภัณฑ์"
          placeholder="เลือกประเภท"
          value={filterType}
          maxVisibleOptions={5}
          onChange={(value) => {
            setFilterType(value);
            setPage(1);
          }}
          options={[
            { label: "ทั้งหมด", value: "" },
            ...items.map((item) => ({ label: item.name, value: item.id })),
          ]}
        />
        <Select
          size="md"
          className="w-[230px]"
          label="สถานะการใช้งาน"
          placeholder="เลือกสถานะ"
          value={filterStatus}
          onChange={(value) => {
            setFilterStatus(value);
            setPage(1);
          }}
          options={[
            { label: "ทั้งหมด", value: "" },
            { label: "เปิดการใช้งาน", value: "ACTIVE" },
            { label: "ปิดการใช้งาน", value: "INACTIVE" },
          ]}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-sm font-medium text-white transition-colors hover:bg-[#f28338]"
        >
          ค้นหา
        </button>
      </div>

      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={fetchData} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ลำดับ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ไอคอน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">แบนเนอร์</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ชื่อประเภทผลิตภัณฑ์</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">คำอธิบาย</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">สถานะการใช้งาน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                  </tr>
                ) : visibleItems.map((item, index) => {
                  const isActive = item.isActive !== false;
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr key={item.id} className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]">
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-4 text-center">
                        {item.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.icon}
                            alt={`ไอคอน ${item.name}`}
                            className="mx-auto h-10 w-10 rounded-md border border-[#EAEAEA] object-cover"
                          />
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.bannerImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.bannerImage}
                            alt={`แบนเนอร์ ${item.name}`}
                            className="mx-auto h-12 w-24 rounded-md border border-[#EAEAEA] object-cover"
                          />
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="max-w-[320px] px-4 py-4 text-center text-sm text-gray-600">
                        <span className="line-clamp-2">{item.description || "-"}</span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-medium">
                        <span className={isActive ? "text-[#24A148]" : "text-[#F44034]"}>
                          {isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionIconButton
                            icon={SquarePen}
                            variant="accent"
                            disabled={isUpdating}
                            aria-label={`แก้ไข ${item.name}`}
                            onClick={() => openEdit(item)}
                          />
                          <ActionIconButton
                            icon={Power}
                            variant={isActive ? "danger" : "success"}
                            disabled={isUpdating}
                            aria-label={`${isActive ? "ปิด" : "เปิด"}การใช้งาน ${item.name}`}
                            onClick={() => handleToggleClick(item)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            current={visibleItems.length}
            total={filteredItems.length}
            page={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeForm} />
          <div className="relative max-h-[90vh] w-full max-w-[920px] overflow-y-auto rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#243333]">
                {editItem ? "แก้ไขประเภทผลิตภัณฑ์" : "เพิ่มประเภทผลิตภัณฑ์"}
              </h2>
              <button onClick={closeForm} className="text-[#9CA3AF] hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </div>
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[14px] font-bold text-dark">ภาพไอคอน</p>
                  <ImageUpload value={formIcon} onChange={setFormIcon} />
                </div>
                <div>
                  <p className="mb-2 text-[14px] font-bold text-dark">ภาพแบนเนอร์</p>
                  <ImageUpload value={formBanner} onChange={setFormBanner} />
                </div>
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
