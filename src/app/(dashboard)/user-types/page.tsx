"use client";

import { useEffect, useMemo, useState } from "react";
import { CirclePlus, Power, SquarePen, X } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { ConfirmModal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getTablePageItems,
  getTableTotalPages,
  TablePagination,
} from "@/components/ui/table-pagination";
import {
  createUserTypeCode,
  defaultUserTypes,
  getStoredUserTypes,
  permissionOptions,
  saveStoredUserTypes,
} from "@/lib/userTypeStorage";
import type { PermissionKey, UserType } from "@/types/user-type";

const PAGE_SIZE = 10;

export default function UserTypesPage() {
  const [items, setItems] = useState<UserType[]>(defaultUserTypes);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formItem, setFormItem] = useState<UserType | null | undefined>(undefined);
  const [formName, setFormName] = useState("");
  const [formPermissions, setFormPermissions] = useState<PermissionKey[]>([]);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [toggleItem, setToggleItem] = useState<UserType | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setItems(getStoredUserTypes()), 0);
    return () => window.clearTimeout(handle);
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = appliedSearch.toLowerCase();
    return items.filter((item) => {
      if (keyword && !item.name.toLowerCase().includes(keyword)) return false;
      if (filterType && item.id !== filterType) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [appliedSearch, filterStatus, filterType, items]);

  const totalPages = getTableTotalPages(filteredItems.length, PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const visibleItems = getTablePageItems(filteredItems, currentPage, PAGE_SIZE);
  const isFormOpen = formItem !== undefined;
  const isEditing = Boolean(formItem);

  const handleSearch = () => {
    setAppliedSearch(search.trim());
    setPage(1);
  };

  const persistItems = (nextItems: UserType[]) => {
    try {
      saveStoredUserTypes(nextItems);
      setItems(nextItems);
      setPageError("");
      return true;
    } catch {
      setPageError("ไม่สามารถบันทึกข้อมูลประเภทผู้ใช้งานได้");
      return false;
    }
  };

  const openCreate = () => {
    setFormItem(null);
    setFormName("");
    setFormPermissions([]);
    setFormError("");
  };

  const openEdit = (item: UserType) => {
    setFormItem(item);
    setFormName(item.name);
    setFormPermissions([...item.permissions]);
    setFormError("");
  };

  const closeForm = () => {
    setFormItem(undefined);
    setFormError("");
  };

  const togglePermission = (permission: PermissionKey) => {
    setFormPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
    setFormError("");
  };

  const handleSave = () => {
    const name = formName.trim();
    if (!name) {
      setFormError("กรุณากรอกชื่อประเภทผู้ใช้งาน");
      return;
    }
    if (formPermissions.length === 0) {
      setFormError("กรุณาเลือกสิทธิ์การใช้งานอย่างน้อย 1 รายการ");
      return;
    }
    if (items.some((item) => item.id !== formItem?.id && item.name.toLowerCase() === name.toLowerCase())) {
      setFormError("ชื่อประเภทผู้ใช้งานนี้มีอยู่แล้ว");
      return;
    }

    const timestamp = new Date().toISOString();
    const nextItems = formItem
      ? items.map((item) =>
          item.id === formItem.id
            ? { ...item, name, permissions: formPermissions, updatedAt: timestamp }
            : item
        )
      : [
          ...items,
          {
            id: `user-type-${Date.now()}`,
            code: createUserTypeCode(name, items.map((item) => item.code)),
            name,
            permissions: formPermissions,
            status: "ACTIVE" as const,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];

    if (persistItems(nextItems)) closeForm();
  };

  const handleToggleStatus = () => {
    if (!toggleItem) return;
    const nextStatus: UserType["status"] = toggleItem.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const nextItems = items.map((item) =>
      item.id === toggleItem.id
        ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
        : item
    );
    if (persistItems(nextItems)) setToggleItem(null);
  };

  return (
    <div>
      <div className="flex min-h-[650px] w-full flex-col rounded-3xl border border-[#EAEAEA] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-center justify-between border-b border-[#EAEAEA] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายการประเภทผู้ใช้งาน / สิทธิ์การใช้งาน</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">จัดการข้อมูลประเภทผู้ใช้งาน และกำหนดสิทธิ์การใช้งาน</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#24A148] px-5 text-sm font-medium text-white transition-all hover:bg-[#1e8e3e] hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
          >
            <CirclePlus size={17} />
            เพิ่มประเภทผู้ใช้งาน
          </button>
        </div>

        <div className="mb-7 flex flex-wrap items-center gap-3">
          <Input
            size="md"
            className="w-[260px]"
            label="ค้นหา"
            placeholder="ค้นหาประเภทผู้ใช้งาน"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="ประเภทผู้ใช้งาน"
            placeholder="เลือกประเภท"
            value={filterType}
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

        {pageError && (
          <div className="mb-4 rounded-[8px] border border-[#F44034]/25 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
            {pageError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ลำดับ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ชื่อประเภทผู้ใช้งาน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จำนวนสิทธิ์</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">สถานะการใช้งาน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                </tr>
              ) : visibleItems.map((item, index) => (
                <tr key={item.id} className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]">
                  <td className="px-4 py-4 text-center text-sm text-gray-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">{item.permissions.length} รายการ</td>
                  <td className="px-4 py-4 text-center text-sm font-medium">
                    <span className={item.status === "ACTIVE" ? "text-[#24A148]" : "text-[#F44034]"}>
                      {item.status === "ACTIVE" ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <ActionIconButton
                        icon={SquarePen}
                        variant="accent"
                        aria-label={`แก้ไข ${item.name}`}
                        onClick={() => openEdit(item)}
                      />
                      <ActionIconButton
                        icon={Power}
                        variant={item.status === "ACTIVE" ? "danger" : "success"}
                        aria-label={`${item.status === "ACTIVE" ? "ปิด" : "เปิด"}การใช้งาน ${item.name}`}
                        onClick={() => setToggleItem(item)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
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
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeForm} />
          <div className="relative w-full max-w-[720px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              onClick={closeForm}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-gray-100 hover:text-[#565656]"
              aria-label="ปิด"
            >
              <X size={19} />
            </button>
            <h2 className="text-lg font-bold text-[#243333]">
              {isEditing ? "แก้ไขประเภทผู้ใช้งาน / กำหนดสิทธิ์ผู้ใช้งาน" : "เพิ่มประเภทผู้ใช้งาน / กำหนดสิทธิ์ผู้ใช้งาน"}
            </h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {isEditing ? "แก้ไขประเภทผู้ใช้งาน / กำหนดสิทธิ์ผู้ใช้งาน" : "เพิ่มประเภทผู้ใช้งาน / กำหนดสิทธิ์ผู้ใช้งาน"}
            </p>

            <div className="mt-7">
              <Input
                size="md"
                className="w-full"
                label="ชื่อประเภทผู้ใช้งาน *"
                placeholder="กรอกชื่อประเภทผู้ใช้งาน"
                value={formName}
                onChange={(event) => {
                  setFormName(event.target.value);
                  setFormError("");
                }}
              />
            </div>

            <div className="mt-7 border-t border-[#EAEAEA] pt-5">
              <h3 className="text-sm font-bold text-[#243333]">กำหนดสิทธิ์การใช้งาน *</h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {permissionOptions.map((permission) => (
                  <label key={permission.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#565656]">
                    <input
                      type="checkbox"
                      checked={formPermissions.includes(permission.value)}
                      onChange={() => togglePermission(permission.value)}
                      className="h-4 w-4 cursor-pointer accent-[#07A2A2]"
                    />
                    {permission.label}
                  </label>
                ))}
              </div>
            </div>

            {formError && (
              <div className="mt-5 rounded-[8px] border border-[#F44034]/25 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
                {formError}
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="h-[40px] min-w-[96px] rounded-[10px] border border-[#DCDCDC] px-5 text-sm font-medium text-[#565656] transition-colors hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-[40px] min-w-[112px] rounded-[10px] bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(toggleItem)}
        title={toggleItem?.status === "ACTIVE" ? "ปิดการใช้งานประเภทผู้ใช้งาน" : "เปิดการใช้งานประเภทผู้ใช้งาน"}
        message={
          toggleItem?.status === "ACTIVE"
            ? `ประเภทผู้ใช้งาน “${toggleItem?.name}” จะไม่ปรากฏเป็นตัวเลือกสำหรับผู้ใช้งานใหม่`
            : `ต้องการเปิดการใช้งานประเภทผู้ใช้งาน “${toggleItem?.name}” ใช่หรือไม่?`
        }
        confirmLabel={toggleItem?.status === "ACTIVE" ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        confirmColor={toggleItem?.status === "ACTIVE" ? "danger" : "success"}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleItem(null)}
      />
    </div>
  );
}
