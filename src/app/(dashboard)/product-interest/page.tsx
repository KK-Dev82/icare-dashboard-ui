"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Search, X } from "lucide-react";
import { productInterestApi } from "@/api/product-interest";
import { productApi } from "@/api/product";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { PaginationMeta } from "@/types/member";
import type {
  ProductInterest,
  ProductInterestStats,
  ProductInterestStatus,
} from "@/types/product-interest";
import type { Product } from "@/types/product";

const PAGE_SIZE = 10;

const statusConfig: Record<ProductInterestStatus, { label: string; color: string }> = {
  PENDING: { label: "รอการติดต่อกลับ", color: "#FF944D" },
  CONTACTED: { label: "ติดต่อแล้ว", color: "#2D7CA4" },
  CLOSED: { label: "ปิดรายการ", color: "#707070" },
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

const defaultStats: ProductInterestStats = {
  total: 0,
  pending: 0,
  contacted: 0,
  today: 0,
};

export default function ProductInterestPage() {
  const [stats, setStats] = useState<ProductInterestStats>(defaultStats);
  const [products, setProducts] = useState<Product[]>([]);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedProductId, setAppliedProductId] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedSubmittedDate, setAppliedSubmittedDate] = useState("");
  const [selectedLead, setSelectedLead] = useState<ProductInterest | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: listData,
    loading,
    errorMessage: error,
    refetch: fetchList,
  } = useAsyncData(async () => {
    const res = await productInterestApi.getAll({
      page,
      limit: PAGE_SIZE,
      keyword: appliedSearch || undefined,
      productId: appliedProductId || undefined,
      status: appliedStatus || undefined,
      createdFrom: appliedSubmittedDate || undefined,
      createdTo: appliedSubmittedDate || undefined,
    });
    if (res.success === false) throw new Error(res.message || "โหลดข้อมูลไม่สำเร็จ");
    return {
      items: res.data,
      meta: { ...res.meta, totalPages: Math.max(1, res.meta.totalPages) },
    };
  });

  const items = listData?.items ?? [];
  const meta = listData?.meta ?? defaultMeta;

  const fetchStats = useCallback(async () => {
    const nextStats = await productInterestApi.getStats();
    setStats(nextStats);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      fetchStats().catch((err) => console.error("[product-interest] summary failed", err));
      productApi
        .getAll({ page: 1, limit: 100 })
        .then((res) => {
          if (active && res.success) setProducts(res.data);
        })
        .catch((err) => console.error("[product-interest] products failed", err));
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetchStats]);

  useEffect(() => {
    const timer = window.setTimeout(fetchList, 0);
    return () => window.clearTimeout(timer);
  }, [appliedProductId, appliedSearch, appliedStatus, appliedSubmittedDate, page, fetchList]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search.trim());
    setAppliedProductId(productId);
    setAppliedStatus(status);
    setAppliedSubmittedDate(submittedDate);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleOpenDetail = async (item: ProductInterest) => {
    setDetailLoadingId(item.id);
    setDetailErrorMessage(null);

    try {
      const detail = await productInterestApi.getById(item.id);
      setSelectedLead(detail);
    } catch (err) {
      console.error("[product-interest] detail failed", err);
      setDetailErrorMessage("ไม่สามารถโหลดรายละเอียดรายการได้");
    } finally {
      setDetailLoadingId(null);
    }
  };

  const productOptions = [
    { label: "ทั้งหมด", value: "" },
    ...products.map((item) => ({ label: item.title, value: item.id })),
  ];

  return (
    <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#EAEAEA] pb-6">
        <h1 className="text-xl font-bold leading-8 text-[#243333]">
          รายการผู้สนใจผลิตภัณฑ์
        </h1>
        <p className="text-base leading-[25px] text-[#9FA2A9]">
          รวบรวมการผู้ใช้งานที่สนใจผลิตภัณฑ์ เพื่อให้เจ้าหน้าที่ติดต่อกลับ
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ทั้งหมด" value={stats.total} color="#07A2A2" />
        <StatCard label="รอการติดต่อ" value={stats.pending} color="#FF944D" />
        <StatCard label="ติดต่อแล้ว" value={stats.contacted} color="#2D7CA4" />
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
          label="ผลิตภัณฑ์"
          placeholder="เลือกผลิตภัณฑ์"
          value={productId}
          onChange={setProductId}
          options={productOptions}
        />
        <Select
          size="md"
          className="w-full"
          label="สถานะติดต่อ"
          placeholder="เลือกสถานะ"
          value={status}
          onChange={setStatus}
          options={[
            { label: "ทั้งหมด", value: "" },
            { label: "รอการติดต่อกลับ", value: "PENDING" },
            { label: "ติดต่อแล้ว", value: "CONTACTED" },
            { label: "ปิดรายการ", value: "CLOSED" },
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
      </div>

      {!loading && error && items.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
          <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
          <button
            type="button"
            onClick={fetchList}
            className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF944D]/10"
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
            className="ml-4 shrink-0 rounded-[6px] border border-[#F44034]/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#F44034]/10"
          >
            ปิด
          </button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1180px] table-fixed">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[170px]" />
            <col className="w-[180px]" />
            <col className="w-[170px]" />
            <col />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
          </colgroup>
          <thead>
            <tr>
              <TableHead>ลำดับ</TableHead>
              <TableHead>เลขคำร้อง</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
              <TableHead>ผู้ติดต่อ</TableHead>
              <TableHead>ผลิตภัณฑ์ที่สนใจ</TableHead>
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
                <td colSpan={8}>
                  <ErrorState message={error} onRetry={fetchList} />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-[#9CA3AF]">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const statusItem = getStatus(item);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                  >
                    <TableCell>{(meta.page - 1) * meta.limit + index + 1}</TableCell>
                    <TableCell>{getLeadNo(item)}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{getContactName(item)}</TableCell>
                    <TableCell className="truncate">{getProductName(item)}</TableCell>
                    <TableCell>{formatThaiDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <span style={{ color: statusItem.color }}>{statusItem.label}</span>
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

      <ProductInterestDetailModal
        open={Boolean(selectedLead)}
        item={selectedLead}
        saving={statusSaving}
        onSave={async (nextStatus) => {
          if (!selectedLead) return;
          setStatusSaving(true);
          try {
            const nextLead = await productInterestApi.updateStatus(selectedLead.id, nextStatus);
            setSelectedLead(nextLead);
            await Promise.all([fetchList(), fetchStats()]);
            setSelectedLead(null);
          } finally {
            setStatusSaving(false);
          }
        }}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}

function ProductInterestDetailModal({
  open,
  item,
  saving,
  onSave,
  onClose,
}: {
  open: boolean;
  item: ProductInterest | null;
  saving: boolean;
  onSave: (status: ProductInterestStatus) => Promise<void>;
  onClose: () => void;
}) {
  const [formStatus, setFormStatus] = useState<ProductInterestStatus>("PENDING");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (item) setFormStatus(item.status);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [item]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[20px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
          aria-label="ปิด"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-lg font-bold leading-6 text-[#243333]">
          ข้อมูลผู้สนใจผลิตภัณฑ์
        </h2>
        <p className="mt-1 text-sm leading-5 text-[#9CA3AF]">{getLeadNo(item)}</p>

        <div className="mt-6 space-y-4">
          <InfoItem label="เบอร์โทรศัพท์" value={item.phone} />
          <InfoItem label="วันที่ส่ง:" value={formatLeadDateTime(item.createdAt)} />
          <InfoItem label="ผลิตภัณฑ์ที่สนใจ" value={getProductName(item)} />
          <InfoItem label="ผู้ติดต่อ" value={getContactName(item)} />
          <InfoItem label="เบอร์โทรศัพท์" value={item.phone} />
          {item.email && <InfoItem label="อีเมล" value={item.email} />}
          <InfoItem label="รายละเอียด" value={item.note || "-"} />

          <div>
            <p className="text-xs font-semibold leading-5 text-[#707070]">สถานะ</p>
            <Select
              size="md"
              className="mt-1 w-full"
              value={formStatus}
              onChange={(value) => setFormStatus(value as ProductInterestStatus)}
              options={[
                { label: "รอการติดต่อกลับ", value: "PENDING" },
                { label: "ติดต่อแล้ว", value: "CONTACTED" },
                { label: "ปิดรายการ", value: "CLOSED" },
              ]}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(formStatus)}
            className="h-[40px] rounded-[8px] bg-[#24A148] text-sm font-medium text-white transition hover:bg-[#1f8f3f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            บันทึก
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-[40px] rounded-[8px] bg-[#CFCFCF] text-sm font-medium text-white transition hover:bg-[#BDBDBD] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ยกเลิก
          </button>
        </div>
      </div>
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

function InfoItem({
  label,
  value,
  valueClassName = "",
  valueStyle,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <p className="text-xs font-semibold leading-5 text-[#707070]">{label}</p>
      <p
        className={`mt-0.5 text-sm leading-5 text-[#9FA2A9] ${valueClassName}`}
        style={valueStyle}
      >
        {value}
      </p>
    </div>
  );
}

function getLeadNo(item: ProductInterest) {
  return item.leadNo || "-";
}

function getContactName(item: ProductInterest) {
  return item.fullName || "-";
}

function getProductName(item: ProductInterest) {
  return item.product?.title || "-";
}

function getStatus(item: ProductInterest) {
  return statusConfig[item.status] ?? statusConfig.PENDING;
}

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLeadDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
