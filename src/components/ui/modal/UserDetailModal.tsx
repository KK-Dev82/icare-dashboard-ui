"use client";

import { X } from "lucide-react";
import type { AdminUser } from "@/types/user";

interface UserDetailModalProps {
  open: boolean;
  user: AdminUser | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "admin",
  ADMIN: "user",
};

function splitFullName(fullName?: string | null) {
  if (!fullName) return { firstName: "-", lastName: "-" };

  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "-",
    lastName: parts.slice(1).join(" ") || "-",
  };
}

export function UserDetailModal({
  open,
  user,
  loading = false,
  error = "",
  onClose,
}: UserDetailModalProps) {
  if (!open) return null;

  const { firstName, lastName } = splitFullName(user?.fullName);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[24px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-lg font-bold text-[#243333]">ข้อมูลผู้ใช้งาน</h2>

        {loading ? (
          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mb-2 h-3 w-16 rounded bg-gray-100" />
                <div className="h-4 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-lg bg-[#FDECEC] px-4 py-3 text-sm text-[#F44034]">
            {error}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <InfoItem label="ชื่อผู้ใช้งาน" value={user?.username || "-"} />
            <InfoItem
              label="ประเภทผู้ใช้งาน"
              value={user ? roleLabel[user.role] || user.role.toLowerCase() : "-"}
            />
            <InfoItem label="ชื่อ" value={firstName} />
            <InfoItem label="นามสกุล" value={lastName} />
            <InfoItem label="อีเมล" value={user?.email || "-"} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#707070]">{label}</p>
      <p className="mt-1 text-sm text-[#9CA3AF]">{value}</p>
    </div>
  );
}
