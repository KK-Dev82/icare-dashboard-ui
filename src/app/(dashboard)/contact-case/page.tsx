"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { contactCaseApi } from "@/api/contact-case";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { ContactCaseDetailModal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAsyncData } from "@/hooks/useAsyncData";
import type {
  ContactCase,
  ContactCaseReadStatus,
  ContactCaseStats,
  ContactCategory,
} from "@/types/contact-case";
import type { PaginationMeta } from "@/types/member";

const PAGE_SIZE = 10;

const statusConfig: Record<ContactCaseReadStatus, { label: string; color: string }> = {
  READ: { label: "อ่านแล้ว", color: "#2D7CA4" },
  UNREAD: { label: "ยังไม่ได้อ่าน", color: "#FF944D" },
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

const defaultStats: ContactCaseStats = {
  total: 0,
  unread: 0,
  read: 0,
  today: 0,
};

export default function ContactCasePage() {
  const [stats, setStats] = useState<ContactCaseStats>(defaultStats);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [readStatus, setReadStatus] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategoryId, setAppliedCategoryId] = useState("");
  const [appliedReadStatus, setAppliedReadStatus] = useState("");
  const [appliedSubmittedDate, setAppliedSubmittedDate] = useState("");
  const [selectedContactCase, setSelectedContactCase] = useState<ContactCase | null>(null);
  const [page, setPage] = useState(1);
  const readTimerRef = useRef<number | null>(null);

  const {
    data: listData,
    loading,
    errorMessage: error,
    refetch: fetchList,
  } = useAsyncData(async () => {
    const res = await contactCaseApi.getAll({
      page,
      limit: PAGE_SIZE,
      keyword: appliedSearch || undefined,
      categoryId: appliedCategoryId || undefined,
      readStatus: appliedReadStatus || undefined,
      submittedFrom: appliedSubmittedDate || undefined,
      submittedTo: appliedSubmittedDate || undefined,
    });
    return {
      items: res.data,
      meta: { ...res.meta, totalPages: Math.max(1, res.meta.totalPages) },
    };
  });

  const items = listData?.items ?? [];
  const meta = listData?.meta ?? defaultMeta;

  const fetchStats = useCallback(async () => {
    const nextStats = await contactCaseApi.getStats();
    setStats(nextStats);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      fetchStats().catch((err) => console.error("[contact-case] summary failed", err));
      contactCaseApi
        .getCategories()
        .then((res) => {
          if (active) {
            setCategories(res.filter((item) => item.isActive !== false));
          }
        })
        .catch((err) => console.error("[contact-case] categories failed", err));
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetchStats]);

  useEffect(() => {
    const timer = window.setTimeout(fetchList, 0);
    return () => window.clearTimeout(timer);
  }, [appliedCategoryId, appliedReadStatus, appliedSearch, appliedSubmittedDate, page, fetchList]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchList(), fetchStats()]);
  }, [fetchList, fetchStats]);

  const clearReadTimer = useCallback(() => {
    if (readTimerRef.current) {
      window.clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }
  }, []);

  const scheduleMarkRead = useCallback(
    (contactCase: ContactCase) => {
      clearReadTimer();

      if (contactCase.readStatus !== "UNREAD") return;

      readTimerRef.current = window.setTimeout(async () => {
        try {
          const nextContactCase = await contactCaseApi.markRead(contactCase.id);
          setSelectedContactCase((current) =>
            current?.id === contactCase.id
              ? { ...current, ...nextContactCase, category: current.category ?? nextContactCase.category }
              : current
          );
          await refreshData();
        } catch (err) {
          console.error("[contact-case] mark read failed", err);
        } finally {
          readTimerRef.current = null;
        }
      }, 3000);
    },
    [clearReadTimer, refreshData]
  );

  useEffect(() => clearReadTimer, [clearReadTimer]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search.trim());
    setAppliedCategoryId(categoryId);
    setAppliedReadStatus(readStatus);
    setAppliedSubmittedDate(submittedDate);
  };

  const handleClear = () => {
    setSearch("");
    setCategoryId("");
    setReadStatus("");
    setSubmittedDate("");
    setPage(1);
    setAppliedSearch("");
    setAppliedCategoryId("");
    setAppliedReadStatus("");
    setAppliedSubmittedDate("");
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleOpenDetail = async (item: ContactCase) => {
    setDetailLoadingId(item.id);
    setDetailErrorMessage(null);

    try {
      const detail = await contactCaseApi.getById(item.id);
      setSelectedContactCase(detail);
      scheduleMarkRead(detail);
    } catch (err) {
      console.error("[contact-case] detail failed", err);
      setDetailErrorMessage("ไม่สามารถโหลดรายละเอียดคำร้องได้");
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleCloseDetail = () => {
    clearReadTimer();
    setSelectedContactCase(null);
  };

  const categoryOptions = [
    { label: "ทั้งหมด", value: "" },
    ...categories.map((item) => ({ label: item.name, value: item.id })),
  ];

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

      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(160px,1fr)_220px_220px_220px_125px_95px] lg:items-center">
        <Input
          size="md"
          className="w-full"
          label="ค้นหา"
          placeholder="ค้นหาเลขที่เรื่อง, หัวข้อ, เบอร์โทรศัพท์, ผู้ติดต่อ"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
        />
        <Select
          size="md"
          className="w-full"
          label="ประเภท"
          placeholder="เลือกประเภท"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
        />
        <Select
          size="md"
          className="w-full"
          label="สถานะการอ่าน"
          placeholder="เลือกสถานะ"
          value={readStatus}
          onChange={setReadStatus}
          options={[
            { label: "ทั้งหมด", value: "" },
            { label: "ยังไม่ได้อ่าน", value: "UNREAD" },
            { label: "อ่านแล้ว", value: "READ" },
          ]}
        />
        <div className="relative w-full">
          <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-dark">
            กำหนด วันที่
          </label>
          <input
            type="date"
            value={submittedDate}
            onChange={(event) => setSubmittedDate(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] bg-white px-4 pr-11 text-[14px] text-[#565656] outline-none transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(7,162,162,0.08)] focus:border-primary [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <CalendarDays
            size={17}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#243333]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]"
        >
          ค้นหา
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="h-[42px] rounded-[8px] border border-[#DCDCDC] bg-white px-5 text-[14px] font-medium text-[#707070] transition hover:border-primary hover:text-primary"
        >
          ล้าง
        </button>
      </div>

      {!loading && error && items.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
          <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
          <button
            type="button"
            onClick={fetchList}
            className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium hover:bg-[#FF944D]/10 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {detailErrorMessage && (
        <div className="mt-4 flex items-center justify-between rounded-[8px] border border-[#F44034]/30 bg-[#F44034]/5 px-4 py-3 text-sm text-[#F44034]">
          <span>{detailErrorMessage}</span>
          <button
            type="button"
            onClick={() => setDetailErrorMessage(null)}
            className="ml-4 shrink-0 rounded-[6px] border border-[#F44034]/30 px-3 py-1 text-xs font-medium hover:bg-[#F44034]/10 transition-colors"
          >
            ปิด
          </button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1180px] table-fixed">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[190px]" />
            <col className="w-[190px]" />
            <col className="w-[170px]" />
            <col />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
          </colgroup>
          <thead>
            <tr>
              <TableHead>ลำดับ</TableHead>
              <TableHead>เลขที่เรื่อง</TableHead>
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
            ) : error && items.length === 0 ? (
              <tr>
                <td colSpan={8}><ErrorState message={error} onRetry={fetchList} /></td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-[#9CA3AF]">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const status = statusConfig[item.readStatus];

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-[#F5F5F5] transition-colors ${
                      item.readStatus === "READ"
                        ? "bg-[#F2F7FF] hover:bg-[#EAF2FF]"
                        : "hover:bg-primary/[0.02]"
                    }`}
                  >
                    <TableCell>{(meta.page - 1) * meta.limit + index + 1}</TableCell>
                    <TableCell>{item.caseNo}</TableCell>
                    <TableCell>{item.contactPhone}</TableCell>
                    <TableCell>{item.category?.name ?? "-"}</TableCell>
                    <TableCell className="truncate">{item.subject}</TableCell>
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
                        disabled={detailLoadingId === item.id}
                        onClick={() => handleOpenDetail(item)}
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

      <ContactCaseDetailModal
        open={Boolean(selectedContactCase)}
        contactCase={selectedContactCase}
        onClose={handleCloseDetail}
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
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = Number(value);
    const target = Number.isFinite(numericValue) ? numericValue : 0;

    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        window.clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <div className="flex h-[76px] items-center justify-center gap-8 rounded-[10px] border border-[#EAEAEA] bg-white px-6">
      <span
        className="flex h-[25px] min-w-[86px] items-center justify-center rounded-full px-4 text-[12px] font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <div className="flex items-end gap-4">
        <p className="text-[28px] font-bold leading-none text-[#243333] tabular-nums">
          {displayValue}
        </p>
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
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
