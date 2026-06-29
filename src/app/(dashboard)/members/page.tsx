"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { memberApi } from "@/api/member";
import { ErrorState } from "@/components/ui/error-state";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { PaginationMeta } from "@/types/member";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const accountLevelLabel = {
  MEMBER: "สมาชิก",
  CUSTOMER: "ลูกค้า",
};

const accountLevelColor = {
  MEMBER: "#FF944D",
  CUSTOMER: "#07A2A2",
};

const statusLabel = {
  ACTIVE: "เปิดใช้งาน",
  INACTIVE: "ปิดใช้งาน",
  SUSPENDED: "ระงับ",
};

const statusColor = {
  ACTIVE: "#24A148",
  INACTIVE: "#F44034",
  SUSPENDED: "#FF944D",
};

interface AppliedParams {
  search: string;
  filterLevel: string;
  filterStatus: string;
  page: number;
}

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [appliedParams, setAppliedParams] = useState<AppliedParams>({
    search: "",
    filterLevel: "",
    filterStatus: "",
    page: 1,
  });
  const router = useRouter();

  const { data: listData, loading, errorMessage, refetch } = useAsyncData(async () => {
    const { search: kw, filterLevel: level, filterStatus: status, page } = appliedParams;
    const params: Record<string, string | number> = { page, limit: 10 };
    if (kw) params.keyword = kw;
    if (level) params.accountLevel = level;
    if (status) params.status = status;
    const res = await memberApi.getAll(params);
    if (!res.success) throw new Error("โหลดข้อมูลไม่สำเร็จ");
    return { items: res.data, meta: res.meta ?? defaultMeta };
  });

  const items = listData?.items ?? [];
  const meta = listData?.meta ?? defaultMeta;

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedParams]);

  const handleSearch = () => {
    setAppliedParams((prev) => ({ ...prev, search: search.trim(), page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setAppliedParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAEAEA] p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายการสมาชิก</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">จัดการข้อมูลสมาชิกและกรมธรรม์ได้ในที่เดียว</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Input
            size="md"
            className="w-[280px]"
            label="ค้นหา"
            placeholder="ค้นหาเบอร์โทรศัพท์, อีเมล, ชื่อ, นามสกุล"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="ระดับ"
            placeholder="เลือกระดับ"
            value={filterLevel}
            onChange={(value) => {
              setFilterLevel(value);
              setAppliedParams((prev) => ({ ...prev, filterLevel: value, page: 1 }));
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: "สมาชิก (MEMBER)", value: "MEMBER" },
              { label: "ลูกค้า (CUSTOMER)", value: "CUSTOMER" },
            ]}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="สถานะ"
            placeholder="เลือกสถานะ"
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setAppliedParams((prev) => ({ ...prev, filterStatus: value, page: 1 }));
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: "เปิดใช้งาน", value: "ACTIVE" },
              { label: "ปิดใช้งาน", value: "INACTIVE" },
              { label: "ระงับ", value: "SUSPENDED" },
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
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">อีเมล</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ระดับ</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะ</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 w-6 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-36 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                    <td className="py-4 px-4"><div className="flex justify-end"><div className="w-8 h-8 bg-gray-100 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={8}><ErrorState message={errorMessage} onRetry={() => refetch()} /></td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                </tr>
              ) : items.map((item, idx) => {
                const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ") || "-";
                return (
                  <tr key={item.id} className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors">
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{(meta.page - 1) * meta.limit + idx + 1}</td>
                    <td className="py-4 px-4 text-center text-sm text-gray-800 font-medium">{item.phone}</td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{fullName}</td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{item.email || "-"}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium" style={{ color: accountLevelColor[item.accountLevel] }}>
                        {accountLevelLabel[item.accountLevel]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium" style={{ color: statusColor[item.status] }}>
                        {statusLabel[item.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => router.push(`/members/${item.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#07A2A2] text-white hover:bg-[#07A2A2]/85 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4">
          <p className="text-sm text-gray-400">
            แสดง {items.length} จาก {meta.total} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === meta.page
                    ? "bg-primary text-white"
                    : "border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
