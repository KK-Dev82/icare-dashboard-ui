"use client";

import { useEffect, useState } from "react";
import { Pencil, Power, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/modal";
import { adminUserApi } from "@/api/admin-user";
import { ErrorState } from "@/components/ui/error-state";
import { useAsyncData } from "@/hooks/useAsyncData";
import { defaultUserTypes, getStoredUserTypes } from "@/lib/userTypeStorage";
import type { AdminUser, AdminRole, AdminStatus } from "@/types/admin-user";
import type { UserType } from "@/types/user-type";

const roleLabel: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CONTENT_EDITOR: "Content Editor",
};

const roleColor: Record<AdminRole, string> = {
  SUPER_ADMIN: "#07A2A2",
  ADMIN: "#2D7CA4",
  CONTENT_EDITOR: "#FF944D",
};

const statusLabel: Record<AdminStatus, string> = {
  ACTIVE: "เปิดการใช้งาน",
  INACTIVE: "ปิดการใช้งาน",
};

type AccountFormErrors = Partial<Record<"username" | "fullName" | "email" | "role" | "password", string>>;

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [detailItem, setDetailItem] = useState<AdminUser | null>(null);
  const [toggleItem, setToggleItem] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AdminUser | null>(null);
  const [userTypes, setUserTypes] = useState<UserType[]>(defaultUserTypes);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<AdminRole>("ADMIN");
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState<AccountFormErrors>({});
  const [saving, setSaving] = useState(false);

  const { data: items = [], loading, errorMessage, refetch } = useAsyncData(async () => {
    const res = await adminUserApi.getAll();
    if (!res.success) throw new Error(res.message || "โหลดข้อมูลไม่สำเร็จ");
    return res.data;
  });

  useEffect(() => {
    refetch();
    const handle = window.setTimeout(() => setUserTypes(getStoredUserTypes()), 0);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async () => {
    if (!toggleItem) return;
    if (toggleItem.status === "ACTIVE") { await adminUserApi.delete(toggleItem.id); } else { await adminUserApi.update(toggleItem.id, { status: "ACTIVE" }); }
    setToggleItem(null);
    refetch();
  };

  const handleSave = async () => {
    const password = formPassword.trim();
    const email = formEmail.trim();
    const errors: AccountFormErrors = {};

    if (!formFullName.trim()) {
      errors.fullName = "กรุณากรอกชื่อ-นามสกุล";
    }
    if (!editItem && !formUsername.trim()) {
      errors.username = "กรุณากรอกชื่อผู้ใช้";
    }
    if (!formRole) {
      errors.role = "กรุณาเลือกประเภทผู้ใช้งาน";
    }
    if (!email) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง เช่น name@example.com";
    }
    if (!editItem && password.length < 6) {
      errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (editItem && password && password.length < 6) {
      errors.password = "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormError("");
      return;
    }

    setSaving(true);
    setFormError("");
    setFormErrors({});

    try {
      if (editItem) {
        const res = await adminUserApi.update(editItem.id, {
          fullName: formFullName.trim(),
          email,
          role: formRole,
          password: password || undefined,
        });
        if (!res.success) throw new Error(res.message || "บันทึกข้อมูลไม่สำเร็จ");
      } else {
        const res = await adminUserApi.create({
          username: formUsername.trim(),
          password,
          fullName: formFullName.trim(),
          email,
          role: formRole,
        });
        if (!res.success) throw new Error(res.message || "สร้างผู้ใช้งานไม่สำเร็จ");
      }
      closeForm();
      refetch();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setFormUsername("");
    setFormPassword("");
    setFormFullName("");
    setFormEmail("");
    const activeUserTypes = userTypes.filter((userType) => userType.status === "ACTIVE");
    setFormRole(activeUserTypes.find((userType) => userType.code === "ADMIN")?.code || activeUserTypes[0]?.code || "");
    setFormError("");
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (item: AdminUser) => {
    setEditItem(item);
    setFormUsername(item.username);
    setFormPassword("");
    setFormFullName(item.fullName);
    setFormEmail(item.email || "");
    setFormRole(item.role);
    setFormError("");
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setFormError("");
    setFormErrors({});
  };

  const handleSearch = () => {
    setAppliedSearch(search.trim());
  };

  const filtered = items.filter((item) => {
    const keyword = appliedSearch.toLowerCase();
    if (
      keyword &&
      !item.fullName.toLowerCase().includes(keyword) &&
      !item.username.toLowerCase().includes(keyword) &&
      !(item.email || "").toLowerCase().includes(keyword)
    ) return false;
    if (appliedRole && item.role !== appliedRole) return false;
    if (appliedStatus && item.status !== appliedStatus) return false;
    return true;
  });

  const getRoleName = (role: AdminRole) =>
    userTypes.find((userType) => userType.code === role)?.name || roleLabel[role] || role;

  const formRoleOptions = userTypes
    .filter((userType) => userType.status === "ACTIVE" || userType.code === formRole)
    .map((userType) => ({ label: userType.name, value: userType.code }));

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ผู้ใช้งานระบบ</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">จัดการบัญชีผู้ดูแลระบบ CMS</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#24A148] text-white text-sm font-medium hover:bg-[#1e8e3e] transition-all hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
          >
            <Plus size={18} />
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-8">
          <Input
            size="md"
            className="w-[280px]"
            label="ค้นหา"
            placeholder="ค้นหาชื่อ, ชื่อผู้ใช้, อีเมล"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="ประเภทผู้ใช้งาน"
            placeholder="เลือกบทบาท"
            value={filterRole}
            onChange={(value) => {
              setFilterRole(value);
              setAppliedRole(value);
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              ...userTypes.map((userType) => ({ label: userType.name, value: userType.code })),
            ]}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="สถานะการใช้งาน"
            placeholder="เลือกสถานะ"
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setAppliedStatus(value);
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: statusLabel.ACTIVE, value: "ACTIVE" },
              { label: statusLabel.INACTIVE, value: "INACTIVE" },
            ]}
          />
        </div>

        {/* Stale data warning */}
        {!loading && errorMessage && items.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
            <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium hover:bg-[#FF944D]/10 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ลำดับ</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อผู้ใช้</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อ</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">อีเมล</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ประเภทผู้ใช้งาน</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะการใช้งาน</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-6 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-36 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="flex justify-end gap-2"><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="w-8 h-8 bg-gray-100 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={7}><ErrorState message={errorMessage} onRetry={() => refetch()} /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors">
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{item.username}</td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-gray-800">{item.fullName}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{item.email || "-"}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-medium" style={{ color: roleColor[item.role] || "#565656" }}>
                      {getRoleName(item.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-sm font-medium ${item.status === "ACTIVE" ? "text-[#24A148]" : "text-[#F44034]"}`}>
                      {statusLabel[item.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/85 transition-colors"
                        aria-label={`ดูรายละเอียด ${item.fullName}`}
                      >
                        <Search size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FF944D] text-white hover:bg-[#FF944D]/85 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setToggleItem(item)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-white transition-colors ${
                          item.status === "ACTIVE"
                            ? "bg-[#F44034] hover:bg-[#F44034]/85"
                            : "bg-[#24A148] hover:bg-[#24A148]/85"
                        }`}
                      >
                        <Power size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AccountDetailModal
        item={detailItem}
        roleName={detailItem ? getRoleName(detailItem.role) : ""}
        onClose={() => setDetailItem(null)}
      />

      {/* Toggle Status Confirm */}
      <ConfirmModal
        open={!!toggleItem}
        title={toggleItem?.status === "ACTIVE" ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        message={
          toggleItem?.status === "ACTIVE"
            ? `ต้องการปิดการใช้งานบัญชี "${toggleItem?.fullName}" ใช่หรือไม่?`
            : `ต้องการเปิดการใช้งานบัญชี "${toggleItem?.fullName}" ใช่หรือไม่?`
        }
        confirmLabel={toggleItem?.status === "ACTIVE" ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
        confirmColor={toggleItem?.status === "ACTIVE" ? "danger" : "success"}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleItem(null)}
      />

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeForm} />
          <div className="relative bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 w-full max-w-[520px]">
            <h2 className="text-lg font-bold text-[#243333] mb-6">
              {editItem ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    size="lg"
                    className="w-full"
                    label="ชื่อ-นามสกุล *"
                    placeholder="กรอกชื่อ"
                    value={formFullName}
                    onChange={(e) => {
                      setFormFullName(e.target.value);
                      setFormErrors((current) => ({ ...current, fullName: undefined }));
                    }}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-[#F44034]">{formErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <Select
                    size="lg"
                    className="w-full"
                    label="บทบาท *"
                    placeholder="เลือกบทบาท"
                    value={formRole}
                    onChange={(v) => {
                      setFormRole(v);
                      setFormErrors((current) => ({ ...current, role: undefined }));
                    }}
                    options={formRoleOptions}
                  />
                  {formErrors.role && (
                    <p className="mt-1 text-xs text-[#F44034]">{formErrors.role}</p>
                  )}
                </div>
              </div>
              {!editItem && (
                <Input
                  size="lg"
                  className="w-full"
                  label="Username *"
                  placeholder="กรอก username"
                  value={formUsername}
                  onChange={(e) => {
                    setFormUsername(e.target.value);
                    setFormErrors((current) => ({ ...current, username: undefined }));
                  }}
                />
              )}
              {!editItem && formErrors.username && (
                <p className="-mt-2 text-xs text-[#F44034]">{formErrors.username}</p>
              )}
              <Input
                size="lg"
                className="w-full"
                label="อีเมล *"
                type="email"
                required
                placeholder="กรอกอีเมล"
                value={formEmail}
                onChange={(e) => {
                  setFormEmail(e.target.value);
                  setFormErrors((current) => ({ ...current, email: undefined }));
                }}
              />
              {formErrors.email && (
                <p className="-mt-2 text-xs text-[#F44034]">{formErrors.email}</p>
              )}
              <Input
                size="lg"
                className="w-full"
                label={editItem ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน *"}
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={formPassword}
                onChange={(e) => {
                  setFormPassword(e.target.value);
                  setFormErrors((current) => ({ ...current, password: undefined }));
                }}
              />
              <p className="-mt-2 text-xs text-[#9FA2A9]">
                {editItem
                  ? "ถ้าต้องการเปลี่ยนรหัสผ่านใหม่ ต้องมีอย่างน้อย 6 ตัวอักษร"
                  : "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"}
              </p>
              {formErrors.password && (
                <p className="-mt-2 text-xs text-[#F44034]">{formErrors.password}</p>
              )}
              {formError && (
                <div className="rounded-[8px] border border-[#F44034]/25 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
                  {formError}
                </div>
              )}
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
                disabled={saving}
                className="h-[40px] px-5 rounded-[10px] bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountDetailModal({
  item,
  roleName,
  onClose,
}: {
  item: AdminUser | null;
  roleName: string;
  onClose: () => void;
}) {
  if (!item) return null;

  const { firstName, lastName } = splitFullName(item.fullName);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-[20px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
          aria-label="ปิด"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-lg font-bold leading-6 text-[#243333]">ข้อมูลผู้ใช้งาน</h2>

        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailItem label="ชื่อผู้ใช้งาน" value={item.username} />
          <DetailItem label="ประเภทผู้ใช้งาน" value={roleName} />
          <DetailItem label="ชื่อ" value={firstName} />
          <DetailItem label="นามสกุล" value={lastName} />
          <DetailItem label="อีเมล" value={item.email || "-"} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold leading-5 text-[#707070]">{label}</p>
      <p className="mt-0.5 text-sm leading-5 text-[#9FA2A9]">{value}</p>
    </div>
  );
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "-",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "-",
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const responseData = (error as { response?: { data?: unknown } }).response?.data;
    const message = getResponseMessage(responseData);
    if (message) return message;
    return error.message || "บันทึกข้อมูลไม่สำเร็จ";
  }

  return "บันทึกข้อมูลไม่สำเร็จ";
}

function getResponseMessage(data: unknown) {
  if (!data || typeof data !== "object") return "";

  const message = (data as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return "";
}
