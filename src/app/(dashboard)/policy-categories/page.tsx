"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Power,
  Search,
  SquarePen,
} from "lucide-react";
import { userApi } from "@/api/user";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { UserDetailModal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import type { AdminUser } from "@/types/user";

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "admin",
  ADMIN: "user",
};

export default function PolicyCategoriesPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      if (res.success) {
        setUsers(res.data);
        setError("");
      } else {
        setError(res.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      }
    } catch {
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => {
        if (res.success) {
          setUsers(res.data);
          setError("");
        } else {
          setError(res.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
        }
      })
      .catch(() => {
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.username.toLowerCase().includes(keyword) ||
        (user.fullName || "").toLowerCase().includes(keyword) ||
        (user.email || "").toLowerCase().includes(keyword);
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [filterRole, filterStatus, search, users]);

  const handleSearch = () => {
    setSearch((current) => current.trim());
  };

  const handleViewDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailUser(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const res = await userApi.getById(id);
      if (res.success) {
        setDetailUser(res.data);
      } else {
        setDetailError(res.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      }
    } catch {
      setDetailError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id);
    setError("");

    try {
      const res = await userApi.deactivate(id);
      if (res.success) {
        await fetchUsers();
      } else {
        setError(res.message || "ไม่สามารถปิดการใช้งานผู้ใช้งานได้");
      }
    } catch {
      setError("ไม่สามารถปิดการใช้งานผู้ใช้งานได้");
    } finally {
      setDeactivatingId("");
    }
  };

  return (
    <div>
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-lg font-bold text-[#243333]">รายการผู้ใช้งาน</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              จัดการข้อมูลผู้ใช้งานได้ในที่เดียว
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/policy-categories/create")}
            className="flex h-[39px] min-w-[145px] items-center justify-center gap-2 rounded-[6px] bg-[#24A148] px-4 text-sm font-medium text-white transition-all hover:bg-[#1e8e3e] hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
          >
            <CirclePlus size={16} />
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Input
            size="md"
            className="w-[230px]"
            label="ค้นหา"
            placeholder="ค้นหา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="ประเภทผู้ใช้งาน"
            placeholder="เลือกสถานะ"
            value={filterRole}
            onChange={setFilterRole}
            options={[
              { label: "admin", value: "SUPER_ADMIN" },
              { label: "user", value: "ADMIN" },
            ]}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="สถานะการใช้งาน"
            placeholder="เลือกสถานะ"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: "เปิดการใช้งาน", value: "ACTIVE" },
              { label: "ปิดการใช้งาน", value: "INACTIVE" },
            ]}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]"
          >
            ค้นหา
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-[#FDECEC] px-4 py-3 text-sm text-[#F44034]">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchUsers}
              className="ml-4 shrink-0 rounded-[6px] border border-[#F44034]/30 px-3 py-1 text-xs font-medium hover:bg-[#F44034]/20 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed">
            <colgroup>
              <col className="w-[110px]" />
              <col className="w-[180px]" />
              <col className="w-[240px]" />
              <col className="w-[240px]" />
              <col className="w-[150px]" />
              <col className="w-[190px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  ลำดับ
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  ชื่อผู้ใช้งาน
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  ชื่อ
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  อีเมล
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  ประเภทผู้ใช้งาน
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  สถานะการใช้งาน
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-[#F5F5F5] animate-pulse">
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-6 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-28 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-36 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-14 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="mx-auto flex justify-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-100" />
                        <div className="h-8 w-8 rounded-lg bg-gray-100" />
                        <div className="h-8 w-8 rounded-lg bg-gray-100" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-[#9CA3AF]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isActive = user.status === "ACTIVE";

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="px-4 py-4 text-center text-sm text-[#707070]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-[#707070]">
                        {user.username}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-[#707070]">
                        {user.fullName || "-"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-[#707070]">
                        {user.email || "-"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span
                          className={
                            user.role === "SUPER_ADMIN"
                              ? "text-[#24A148]"
                              : "text-[#9FA2A9]"
                          }
                        >
                          {roleLabel[user.role] || user.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={isActive ? "text-[#24A148]" : "text-[#F44034]"}>
                          {isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionIconButton
                            icon={Search}
                            variant="primary"
                            iconSize={16}
                            iconStrokeWidth={3}
                            onClick={() => handleViewDetail(user.id)}
                          />
                          <ActionIconButton
                            icon={SquarePen}
                            variant="accent"
                            iconStrokeWidth={2.6}
                            onClick={() =>
                              router.push(`/policy-categories/${user.id}/edit`)
                            }
                          />
                          <ActionIconButton
                            icon={Power}
                            variant={isActive ? "danger" : "success"}
                            iconStrokeWidth={3}
                            disabled={deactivatingId === user.id}
                            onClick={() => handleDeactivate(user.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination current={filteredUsers.length} total={users.length} />
      </div>

      <UserDetailModal
        open={detailOpen}
        user={detailUser}
        loading={detailLoading}
        error={detailError}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
