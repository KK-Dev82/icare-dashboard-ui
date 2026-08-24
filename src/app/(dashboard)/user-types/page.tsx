"use client";

import { useEffect, useMemo, useState } from "react";
import { CirclePlus, Power, SquarePen, X } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  getTablePageItems,
  getTableTotalPages,
  TablePagination,
} from "@/components/ui/table-pagination";
import { userTypeApi } from "@/api/user-type";
import { permissionOptions } from "@/constants/permissions";
import { usePermissions } from "@/contexts/PermissionContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { PermissionKey, UserType } from "@/types/user-type";

const PAGE_SIZE = 10;
const REQUIRED_PERMISSION_WARNING =
  "กรุณาเลือกสิทธิ์การใช้งานอย่างน้อย 1 รายการก่อนบันทึก";

export default function UserTypesPage() {
  const { profile, refreshProfile } = usePermissions();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formItem, setFormItem] = useState<UserType | null | undefined>(undefined);
  const [formName, setFormName] = useState("");
  const [formPermissions, setFormPermissions] = useState<PermissionKey[]>([]);
  const [formMailContactCase, setFormMailContactCase] = useState(false);
  const [formMailLeads, setFormMailLeads] = useState(false);
  const [formError, setFormError] = useState("");
  const [formWarning, setFormWarning] = useState("");
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toggleItem, setToggleItem] = useState<UserType | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const { data: items = [], loading, errorMessage, refetch } = useAsyncData(async () => {
    const response = await userTypeApi.getAll();
    if (!response.success) throw new Error(response.message || "โหลดข้อมูลประเภทผู้ใช้งานไม่สำเร็จ");
    return response.data;
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = appliedSearch.toLowerCase();
    return items.filter((item) => {
      if (keyword && !item.name.toLowerCase().includes(keyword)) return false;
      if (filterType && item.id !== filterType) return false;
      if (filterStatus && (item.isActive ? "ACTIVE" : "INACTIVE") !== filterStatus) return false;
      return true;
    });
  }, [appliedSearch, filterStatus, filterType, items]);

  const totalPages = getTableTotalPages(filteredItems.length, PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const visibleItems = getTablePageItems(filteredItems, currentPage, PAGE_SIZE);
  const isFormOpen = formItem !== undefined;
  const isEditing = Boolean(formItem);
  const hasSelectedPermission = formPermissions.length > 0;

  const handleSearch = () => {
    setAppliedSearch(search.trim());
    setPage(1);
  };

  const openCreate = () => {
    setFormItem(null);
    setFormName("");
    setFormPermissions([]);
    setFormMailContactCase(false);
    setFormMailLeads(false);
    setFormError("");
    setFormWarning(REQUIRED_PERMISSION_WARNING);
    setIsConfirmingEdit(false);
  };

  const openEdit = (item: UserType) => {
    setFormItem(item);
    setFormName(item.name);
    setFormPermissions([...item.permissions]);
    setFormMailContactCase(item.mailContactCase ?? false);
    setFormMailLeads(item.mailLeads ?? false);
    setFormError("");
    setFormWarning(
      item.permissions.length > 0 ? "" : REQUIRED_PERMISSION_WARNING
    );
    setIsConfirmingEdit(false);
  };

  const closeForm = () => {
    setFormItem(undefined);
    setFormError("");
    setFormWarning("");
    setIsConfirmingEdit(false);
  };

  const togglePermission = (permission: PermissionKey) => {
    const nextPermissions = formPermissions.includes(permission)
      ? formPermissions.filter((item) => item !== permission)
      : [...formPermissions, permission];

    setFormPermissions(nextPermissions);
    setFormError("");
    setFormWarning(
      nextPermissions.length > 0 ? "" : REQUIRED_PERMISSION_WARNING
    );
    setIsConfirmingEdit(false);
  };

  const updateEmailPreference = (
    type: "contact-case" | "leads",
    value: boolean,
  ) => {
    if (type === "contact-case") {
      setFormMailContactCase(value);
    } else {
      setFormMailLeads(value);
    }

    setFormError("");
    setFormWarning(
      formPermissions.length > 0 ? "" : REQUIRED_PERMISSION_WARNING,
    );
    setIsConfirmingEdit(false);
  };

  const handleSave = async () => {
    const name = formName.trim();
    if (!name) {
      setFormError("กรุณากรอกชื่อประเภทผู้ใช้งาน");
      setFormWarning("");
      setIsConfirmingEdit(false);
      return;
    }
    if (formPermissions.length === 0) {
      setFormError("");
      setFormWarning(REQUIRED_PERMISSION_WARNING);
      setIsConfirmingEdit(false);
      return;
    }
    if (items.some((item) => item.id !== formItem?.id && item.name.toLowerCase() === name.toLowerCase())) {
      setFormError("ชื่อประเภทผู้ใช้งานนี้มีอยู่แล้ว");
      setFormWarning("");
      setIsConfirmingEdit(false);
      return;
    }

    if (isEditing && !isConfirmingEdit) {
      setFormError("");
      setFormWarning(
        "การเปลี่ยนแปลงนี้จะมีผลต่อสิทธิ์การใช้งานของผู้ใช้งานในประเภทนี้ ต้องการบันทึกใช่หรือไม่"
      );
      setIsConfirmingEdit(true);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = formItem
        ? await userTypeApi.update(formItem.id, {
            name,
            permissions: formPermissions,
            mailContactCase: formMailContactCase,
            mailLeads: formMailLeads,
          })
        : await userTypeApi.create({
            name,
            permissions: formPermissions,
            mailContactCase: formMailContactCase,
            mailLeads: formMailLeads,
          });
      if (!response.success) throw new Error(response.message || "บันทึกข้อมูลไม่สำเร็จ");
      toast.success(
        isEditing
          ? "แก้ไขประเภทผู้ใช้งานและสิทธิ์การใช้งานสำเร็จ"
          : "เพิ่มประเภทผู้ใช้งานและสิทธิ์การใช้งานสำเร็จ"
      );
      closeForm();
      setPageError("");
      await Promise.all([
        refetch(),
        formItem?.id === profile?.roleId ? refreshProfile() : Promise.resolve(),
      ]);
    } catch (error) {
      setFormWarning("");
      setIsConfirmingEdit(false);
      const { code, message } = getApiError(error);
      if (code === "ROLE_ALREADY_EXISTS") {
        setFormError("ชื่อประเภทผู้ใช้งานนี้มีอยู่แล้ว");
      } else if (code === "ROLE_NOT_FOUND") {
        closeForm();
        setPageError("ไม่พบประเภทผู้ใช้งานที่ต้องการแก้ไข กรุณาโหลดข้อมูลใหม่");
        await refetch();
      } else {
        setFormError(message || "ไม่สามารถบันทึกข้อมูลประเภทผู้ใช้งานได้");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleItem || toggling) return;
    setToggling(true);
    setPageError("");
    try {
      const wasActive = toggleItem.isActive;
      const isCurrentRole = toggleItem.id === profile?.roleId;
      const response = await userTypeApi.toggle(toggleItem.id);
      if (!response.success) throw new Error(response.message || "เปลี่ยนสถานะไม่สำเร็จ");
      toast.success(
        wasActive
          ? "ปิดการใช้งานประเภทผู้ใช้งานสำเร็จ"
          : "เปิดการใช้งานประเภทผู้ใช้งานสำเร็จ"
      );
      setToggleItem(null);
      await Promise.all([
        refetch(),
        isCurrentRole ? refreshProfile() : Promise.resolve(),
      ]);
    } catch (error) {
      const { code, message } = getApiError(error);
      setToggleItem(null);
      setPageError(
        code === "ROLE_NOT_FOUND"
          ? "ไม่พบประเภทผู้ใช้งานที่ต้องการเปลี่ยนสถานะ กรุณาโหลดข้อมูลใหม่"
          : message || "ไม่สามารถเปลี่ยนสถานะประเภทผู้ใช้งานได้"
      );
      if (code === "ROLE_NOT_FOUND") await refetch();
    } finally {
      setToggling(false);
    }
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

        {!loading && errorMessage && items.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
            <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF944D]/10"
            >
              ลองใหม่
            </button>
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
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4">
                        <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message={errorMessage} onRetry={() => refetch()} />
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                </tr>
              ) : visibleItems.map((item, index) => (
                <tr key={item.id} className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]">
                  <td className="px-4 py-4 text-center text-sm text-gray-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">{item.permissions.length} รายการ</td>
                  <td className="px-4 py-4 text-center text-sm font-medium">
                    <span className={item.isActive ? "text-[#24A148]" : "text-[#F44034]"}>
                      {item.isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
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
                        variant={item.isActive ? "danger" : "success"}
                        aria-label={`${item.isActive ? "ปิด" : "เปิด"}การใช้งาน ${item.name}`}
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
          <div className="relative max-h-[calc(100vh-32px)] w-full max-w-[720px] overflow-y-auto rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
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
                  setFormWarning(
                    hasSelectedPermission ? "" : REQUIRED_PERMISSION_WARNING
                  );
                  setIsConfirmingEdit(false);
                }}
              />
            </div>

            <div className="mt-7 border-y border-[#EAEAEA] py-5">
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

            <div className="mt-5">
              <h3 className="text-sm font-bold text-[#243333]">
                กำหนดสิทธิ์การรับ Email
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#565656]">
                  <input
                    type="checkbox"
                    checked={formMailContactCase}
                    onChange={(event) =>
                      updateEmailPreference("contact-case", event.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer accent-[#07A2A2]"
                  />
                  คำร้อง / ติดต่อ
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#565656]">
                  <input
                    type="checkbox"
                    checked={formMailLeads}
                    onChange={(event) =>
                      updateEmailPreference("leads", event.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer accent-[#07A2A2]"
                  />
                  สนใจผลิตภัณฑ์
                </label>
              </div>
            </div>

            {formError && (
              <div className="mt-5 rounded-[8px] border border-[#F44034]/25 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
                {formError}
              </div>
            )}

            {formWarning && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-5 rounded-[8px] border border-[#F4C95D]/50 bg-[#FFF8DF] px-4 py-3 text-sm text-[#8A6515]"
              >
                {formWarning}
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
                disabled={saving || !hasSelectedPermission}
                className="h-[40px] min-w-[112px] rounded-[10px] bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#9DD8D8] disabled:opacity-60"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : isEditing && isConfirmingEdit
                    ? "ยืนยัน"
                    : isEditing
                      ? "บันทึกการแก้ไข"
                      : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(toggleItem)}
        title={toggleItem?.isActive ? "ปิดการใช้งานประเภทผู้ใช้งาน" : "เปิดการใช้งานประเภทผู้ใช้งาน"}
        message={
          toggleItem?.isActive
            ? `ประเภทผู้ใช้งาน “${toggleItem?.name}” จะไม่ปรากฏเป็นตัวเลือกสำหรับผู้ใช้งานใหม่`
            : `ต้องการเปิดการใช้งานประเภทผู้ใช้งาน “${toggleItem?.name}” ใช่หรือไม่?`
        }
        confirmLabel={toggleItem?.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        confirmColor={toggleItem?.isActive ? "danger" : "success"}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          if (!toggling) setToggleItem(null);
        }}
      />
    </div>
  );
}

function getApiError(error: unknown) {
  const responseData = (
    error as { response?: { data?: { message?: string | string[]; errorCode?: string } } }
  )?.response?.data;
  const rawMessage = responseData?.message;
  const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;

  return {
    code: responseData?.errorCode || "",
    message: message || (error instanceof Error ? error.message : ""),
  };
}
