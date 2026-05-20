"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { memberApi } from "@/api/member";
import type { Member, PaginationMeta } from "@/types/member";

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

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const router = useRouter();

  const fetchData = async (p?: number) => {
    setLoading(true);
    const params: Record<string, string | number> = { page: p || page, limit: 10 };
    if (search) params.keyword = search;
    if (filterLevel) params.accountLevel = filterLevel;
    if (filterStatus) params.status = filterStatus;
    const res = await memberApi.getAll(params);
    if (res.success) {
      setItems(res.data);
      if (res.meta) setMeta(res.meta);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchData(1);
  };

  const handleClear = () => {
    setSearch("");
    setFilterLevel("");
    setFilterStatus("");
    setPage(1);
    fetchData(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage);
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
            placeholder="เบอร์โทร, ชื่อ, นามสกุล"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="ระดับ"
            placeholder="เลือกระดับ"
            value={filterLevel}
            onChange={setFilterLevel}
            options={[
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
            onChange={setFilterStatus}
            options={[
              { label: "เปิดใช้งาน", value: "ACTIVE" },
              { label: "ปิดใช้งาน", value: "INACTIVE" },
              { label: "ระงับ", value: "SUSPENDED" },
            ]}
          />
          <button
            onClick={handleSearch}
            className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]"
          >
            ค้นหา
          </button>
          <button
            onClick={handleClear}
            className="h-[42px] rounded-[8px] border border-[#DCDCDC] px-8 text-[14px] font-medium text-[#565656] transition hover:bg-gray-50"
          >
            ล้าง
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ลำดับ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">อีเมล</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ระดับ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูล</td>
                </tr>
              ) : items.map((item, idx) => {
                const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ") || "-";
                return (
                  <tr key={item.id} className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600">{(meta.page - 1) * meta.limit + idx + 1}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 font-medium">{item.phone}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{fullName}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.email || "-"}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium" style={{ color: accountLevelColor[item.accountLevel] }}>
                        {accountLevelLabel[item.accountLevel]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium" style={{ color: statusColor[item.status] }}>
                        {statusLabel[item.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end">
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
