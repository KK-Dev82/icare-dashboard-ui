"use client";

import { useEffect, useState } from "react";
import { Pencil, Power, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/modal";
import { adminUserApi } from "@/api/admin-user";
import { ErrorState } from "@/components/ui/error-state";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { AdminUser, AdminRole } from "@/types/admin-user";

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

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [toggleItem, setToggleItem] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AdminUser | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<AdminRole>("ADMIN");
  const [saving, setSaving] = useState(false);

  const { data: items = [], loading, errorMessage, refetch } = useAsyncData(async () => {
    const res = await adminUserApi.getAll();
    if (!res.success) throw new Error(res.message || "โหลดข้อมูลไม่สำเร็จ");
    return res.data;
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async () => {
    if (!toggleItem) return;
    if (toggleItem.status === "ACTIVE") { await adminUserApi.delete(toggleItem.id); } else { await adminUserApi.update(toggleItem.id, { status: "ACTIVE" }); }
    setToggleItem(null);
    refetch();
  };

  const handleSave = async () => {
    setSaving(true);
    if (editItem) {
      await adminUserApi.update(editItem.id, {
        fullName: formFullName,
        email: formEmail || undefined,
        role: formRole,
        password: formPassword || undefined,
      });
    } else {
      await adminUserApi.create({
        username: formUsername,
        password: formPassword,
        fullName: formFullName,
        email: formEmail || undefined,
        role: formRole,
      });
    }
    setSaving(false);
    closeForm();
    refetch();
  };

  const openCreate = () => {
    setEditItem(null);
    setFormUsername("");
    setFormPassword("");
    setFormFullName("");
    setFormEmail("");
    setFormRole("ADMIN");
    setShowForm(true);
  };

  const openEdit = (item: AdminUser) => {
    setEditItem(item);
    setFormUsername(item.username);
    setFormPassword("");
    setFormFullName(item.fullName);
    setFormEmail(item.email || "");
    setFormRole(item.role);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const filtered = items.filter((item) => {
    if (search && !item.fullName.toLowerCase().includes(search.toLowerCase()) && !item.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole && item.role !== filterRole) return false;
    return true;
  });

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
          <Input size="md" className="w-[280px]" label="ค้นหา" placeholder="ค้นหาชื่อหรือ username" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select
            size="md"
            className="w-[200px]"
            label="บทบาท"
            placeholder="เลือกบทบาท"
            value={filterRole}
            onChange={setFilterRole}
            options={[
              { label: "Super Admin", value: "SUPER_ADMIN" },
              { label: "Admin", value: "ADMIN" },
              { label: "Content Editor", value: "CONTENT_EDITOR" },
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
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ลำดับ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">Username</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">อีเมล</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">บทบาท</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะ</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
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
                  <td className="py-4 px-4 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-800">{item.fullName}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{item.username}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{item.email || "-"}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium" style={{ color: roleColor[item.role] }}>
                      {roleLabel[item.role]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${item.status === "ACTIVE" ? "text-[#24A148]" : "text-[#F44034]"}`}>
                      {item.status === "ACTIVE" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
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
                <Input
                  size="lg"
                  className="w-full"
                  label="ชื่อ-นามสกุล *"
                  placeholder="กรอกชื่อ"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                />
                <Select
                  size="lg"
                  className="w-full"
                  label="บทบาท *"
                  placeholder="เลือกบทบาท"
                  value={formRole}
                  onChange={(v) => setFormRole(v as AdminRole)}
                  options={[
                    { label: "Super Admin", value: "SUPER_ADMIN" },
                    { label: "Admin", value: "ADMIN" },
                    { label: "Content Editor", value: "CONTENT_EDITOR" },
                  ]}
                />
              </div>
              {!editItem && (
                <Input
                  size="lg"
                  className="w-full"
                  label="Username *"
                  placeholder="กรอก username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                />
              )}
              <Input
                size="lg"
                className="w-full"
                label="อีเมล"
                type="email"
                placeholder="กรอกอีเมล"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
              <Input
                size="lg"
                className="w-full"
                label={editItem ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน *"}
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
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
                disabled={saving || !formFullName || (!editItem && (!formUsername || !formPassword))}
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
