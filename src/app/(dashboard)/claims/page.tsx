"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { claimApi } from "@/api/claim";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import type {
  ClaimRequest,
  ClaimRequestCategory,
  ClaimRequestStatus,
  ClaimStats,
} from "@/types/claim";
import type { PaginationMeta } from "@/types/member";

const PAGE_SIZE = 10;

const categoryLabel: Record<ClaimRequestCategory, string> = {
  QUESTION: "สอบถาม",
  USAGE_PROBLEM: "ปัญหาใช้งาน",
  SUGGESTION: "ข้อเสนอแนะ",
  SERVICE_COMPLAINT: "ร้องเรียนบริการ",
};

const statusConfig: Record<ClaimRequestStatus, { label: string; color: string }> = {
  READ: { label: "อ่านแล้ว", color: "#2D7CA4" },
  UNREAD: { label: "ยังไม่ได้อ่าน", color: "#FF944D" },
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

const defaultStats: ClaimStats = {
  total: 0,
  unread: 0,
  read: 0,
  today: 0,
};

export default function ClaimsPage() {
  const [items, setItems] = useState<ClaimRequest[]>([]);
  const [stats, setStats] = useState<ClaimStats>(defaultStats);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    claimApi.getStats().then((nextStats) => {
      if (active) setStats(nextStats);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    claimApi
      .getAll({
        page,
        limit: PAGE_SIZE,
        keyword: appliedSearch,
        category: appliedCategory,
        status: appliedStatus,
        dateRange: "11 - 05 - 2026",
      })
      .then((res) => {
        if (!active) return;
        setItems(res.data);
        setMeta(res.meta);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedCategory, appliedSearch, appliedStatus, page]);

  const handleSearch = () => {
    setLoading(true);
    setPage(1);
    setAppliedSearch(search);
    setAppliedCategory(category);
    setAppliedStatus(status);
  };

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  return (
    <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#EAEAEA] pb-6">
        <h1 className="text-xl font-bold leading-8 text-[#243333]">
          รายการคำร้อง / การติดต่อ
        </h1>
        <p className="text-base leading-[25px] text-[#9FA2A9]">
          รวมข้อความติดต่อและคำร้องจากผู้ใช้งานไว้ในที่เดียว
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ทั้งหมด" value={stats.total} color="#07A2A2" />
        <StatCard label="ยังไม่ได้อ่าน" value={stats.unread} color="#FF944D" />
        <StatCard label="อ่านแล้ว" value={stats.read} color="#2D7CA4" />
        <StatCard label="วันนี้" value={stats.today} color="#FF7468" />
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(180px,1fr)_230px_230px_230px_145px] lg:items-center">
        <Input
          size="md"
          className="w-full"
          label="ค้นหา"
          placeholder="ค้นหา"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          size="md"
          className="w-full"
          label="ประเภท"
          placeholder="เลือกประเภท"
          value={category}
          onChange={setCategory}
          options={[
            { label: "สอบถาม", value: "QUESTION" },
            { label: "ปัญหาใช้งาน", value: "USAGE_PROBLEM" },
            { label: "ข้อเสนอแนะ", value: "SUGGESTION" },
            { label: "ร้องเรียนบริการ", value: "SERVICE_COMPLAINT" },
          ]}
        />
        <Select
          size="md"
          className="w-full"
          label="สถานะการอ่าน"
          placeholder="เลือกประเภท"
          value={status}
          onChange={setStatus}
          options={[
            { label: "ยังไม่ได้อ่าน", value: "UNREAD" },
            { label: "อ่านแล้ว", value: "READ" },
          ]}
        />
        <div className="relative w-full">
          <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-dark">
            กำหนด วันที่
          </label>
          <input
            type="text"
            value="11 - 05 - 2026"
            readOnly
            className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] bg-white px-4 pr-11 text-[14px] text-[#9CA3AF] outline-none transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)]"
          />
          <CalendarDays
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#243333]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]"
        >
          ค้นหา
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1180px] table-fixed">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[170px]" />
            <col className="w-[190px]" />
            <col className="w-[150px]" />
            <col />
            <col className="w-[140px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
          </colgroup>
          <thead>
            <tr>
              <TableHead>ลำดับ</TableHead>
              <TableHead>เลขที่ร้อง</TableHead>
              <TableHead>ผู้ติดต่อ (เบอร์โทรศัพท์)</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>หัวข้อ</TableHead>
              <TableHead>วันที่ส่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>จัดการ</TableHead>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-5">
                      <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-[#9CA3AF]">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const status = statusConfig[item.status];

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                  >
                    <TableCell>{(meta.page - 1) * meta.limit + index + 1}</TableCell>
                    <TableCell>{item.requestNo}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{categoryLabel[item.category]}</TableCell>
                    <TableCell className="truncate">{item.title}</TableCell>
                    <TableCell>{formatThaiDate(item.submittedAt)}</TableCell>
                    <TableCell>
                      <span style={{ color: status.color }}>{status.label}</span>
                    </TableCell>
                    <TableCell>
                      <ActionIconButton
                        icon={Search}
                        variant="primary"
                        iconSize={16}
                        iconStrokeWidth={3}
                        className="mx-auto rounded-[6px]"
                      />
                    </TableCell>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        current={items.length}
        total={meta.total}
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex h-[76px] items-center justify-center gap-8 rounded-[10px] border border-[#EAEAEA] bg-white px-6">
      <span
        className="flex h-[25px] min-w-[86px] items-center justify-center rounded-full px-4 text-[12px] font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <div className="flex items-end gap-4">
        <p className="text-[28px] font-bold leading-none text-[#243333]">{value}</p>
        <p className="pb-1 text-[13px] text-[#9FA2A9]">รายการ</p>
      </div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-4 text-center text-xs font-semibold text-[#707070]">
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-5 text-center text-sm text-[#707070] ${className}`}>
      {children}
    </td>
  );
}

function formatThaiDate(value: string) {
  const [year, month, day] = value.split("-");
  const monthNames: Record<string, string> = {
    "01": "ม.ค.",
    "02": "ก.พ.",
    "03": "มี.ค.",
    "04": "เม.ย.",
    "05": "พ.ค.",
    "06": "มิ.ย.",
    "07": "ก.ค.",
    "08": "ส.ค.",
    "09": "ก.ย.",
    "10": "ต.ค.",
    "11": "พ.ย.",
    "12": "ธ.ค.",
  };

  return `${Number(day)} ${monthNames[month] ?? month} ${year}`;
}
