"use client";

import { useEffect, useMemo, useState } from "react";
import { CirclePlus, Power, SquarePen, X } from "lucide-react";
import { consentApi } from "@/api/consent";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  getTablePageItems,
  getTableTotalPages,
  TablePagination,
} from "@/components/ui/table-pagination";
import { useToast } from "@/components/ui/toast";
import type { ConsentType } from "@/types/consent";

const PAGE_SIZE = 10;

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
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

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

  const filteredItems = useMemo(() => {
    const keyword = appliedSearch.toLowerCase();
    return items.filter((item) => {
      const status = item.isActive !== false ? "ACTIVE" : "INACTIVE";
      if (
        keyword &&
        !item.name.toLowerCase().includes(keyword) &&
        !item.slug.toLowerCase().includes(keyword)
      ) return false;
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
    <section className="flex min-h-[650px] w-full flex-col rounded-3xl border border-[#EAEAEA] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between border-b border-[#EAEAEA] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายการประเภท Consent</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">จัดการประเภทสำหรับหน้าความยินยอม / นโยบาย</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#24A148] px-5 text-sm font-medium text-white transition-all hover:bg-[#1e8e3e] hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
        >
          <CirclePlus size={17} />
          เพิ่มประเภท Consent
        </button>
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-3">
        <Input
          size="md"
          className="w-[260px]"
          label="ค้นหา"
          placeholder="ค้นหาชื่อประเภทหรือ Slug"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
        />
        <Select
          size="md"
          className="w-[230px]"
          label="ประเภท Consent"
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
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : errorMessage && items.length === 0 ? (
        <ErrorState message={errorMessage} onRetry={fetchData} />
      ) : (
        <>
          {errorMessage && (
            <div className="mb-4 rounded-[8px] border border-[#F44034]/20 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
              {errorMessage}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ลำดับ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ชื่อประเภท Consent</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Slug</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ลำดับการแสดงผล</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">สถานะการใช้งาน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                  </tr>
                ) : visibleItems.map((item, index) => {
                  const isActive = item.isActive !== false;
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr key={item.id} className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]">
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{item.slug}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">{item.sortOrder ?? 0}</td>
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
          <div className="relative w-full max-w-[760px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                <div className="md:col-span-2">
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
                </div>
              )}
              {formError && <p className="text-sm text-[#F44034] md:col-span-2">{formError}</p>}
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
