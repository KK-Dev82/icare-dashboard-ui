"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ClipboardList,
  Search,
  TriangleAlert,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { contentApi } from "@/api/content";
import { notificationApi } from "@/api/notification";
import { productApi } from "@/api/product";
import {
  NotificationPreviewCard,
  type NotificationPreviewContent,
} from "@/components/notification/NotificationPreviewCard";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  buildContentNotificationBody,
  buildContentNotificationPreview,
} from "@/lib/notificationPreview";
import type { Content } from "@/types/content";
import type {
  BroadcastLogStatus,
  NotificationBroadcast,
  NotificationBroadcastFilter,
  NotificationBroadcastType,
} from "@/types/notification-log";
import type { Product } from "@/types/product";

const defaultMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const typeOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "ระบบ", value: "SYSTEM" },
  { label: "ผลิตภัณฑ์", value: "PRODUCT" },
  { label: "ข่าวสาร / โปรโมชั่น", value: "NEWS" },
];

const initialFilter: NotificationBroadcastFilter = { page: 1, limit: 10 };

export default function NotificationLogPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logBroadcast, setLogBroadcast] = useState<NotificationBroadcast | null>(null);
  const [selectedBroadcast, setSelectedBroadcast] =
    useState<NotificationBroadcast | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestRef = useRef(0);
  const [appliedFilter, setAppliedFilter] =
    useState<NotificationBroadcastFilter>(initialFilter);

  const {
    data: listData,
    loading,
    errorMessage,
    refetch,
    hasLoadedOnce,
  } = useAsyncData(async () => {
    const response = await notificationApi.getBroadcasts(appliedFilter);
    if (!response.success) {
      throw new Error("โหลดประวัติการแจ้งเตือนไม่สำเร็จ");
    }

    return {
      items: Array.isArray(response.data) ? response.data : [],
      meta: response.meta ?? defaultMeta,
    };
  });

  const items = listData?.items ?? [];
  const meta = listData?.meta ?? defaultMeta;

  useEffect(() => {
    void refetch();
    // refetch is stable and the request is intentionally driven by applied filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilter]);

  const applyFilters = () => {
    setAppliedFilter((current) => ({
      keyword: keyword.trim() || undefined,
      type: (type || undefined) as NotificationBroadcastType | undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: 1,
      limit: current.limit,
    }));
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setAppliedFilter((current) => ({
      ...current,
      type: (value || undefined) as NotificationBroadcastType | undefined,
      page: 1,
    }));
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setAppliedFilter((current) => ({
      ...current,
      dateFrom: value || undefined,
      page: 1,
    }));
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setAppliedFilter((current) => ({
      ...current,
      dateTo: value || undefined,
      page: 1,
    }));
  };

  const handleOpenDetail = (broadcast: NotificationBroadcast) => {
    const requestId = ++previewRequestRef.current;
    const sourceId = getSourceIdFromDeepLink(broadcast);

    setSelectedBroadcast(broadcast);
    setSelectedContent(null);
    setSelectedProduct(null);

    if (broadcast.type === "SYSTEM") {
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    const sourceRequest =
      broadcast.type === "PRODUCT"
        ? loadProductSource(broadcast, sourceId)
        : loadContentSource(broadcast, sourceId);

    void sourceRequest
      .then((source) => {
        if (previewRequestRef.current !== requestId || !source) return;
        if (broadcast.type === "PRODUCT") {
          setSelectedProduct(source as Product);
        } else {
          setSelectedContent(source as Content);
        }
      })
      .catch(() => {
        // Keep the stored broadcast content when the linked source is unavailable.
      })
      .finally(() => {
        if (previewRequestRef.current === requestId) {
          setPreviewLoading(false);
        }
      });
  };

  const handleCloseDetail = () => {
    previewRequestRef.current += 1;
    setSelectedBroadcast(null);
    setSelectedContent(null);
    setSelectedProduct(null);
    setPreviewLoading(false);
  };

  return (
    <div>
      <div className="flex min-h-[560px] w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-6 border-b border-[#EAEAEA] pb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ประวัติการแจ้งเตือนระบบ
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            แสดงประวัติการส่งข้อความแจ้งเตือนแบบ Broadcast
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Input
            size="md"
            className="w-[280px]"
            label="ค้นหา"
            placeholder="ค้นหาหัวข้อหรือรายละเอียด"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyFilters();
            }}
          />
          <Select
            size="md"
            className="w-[180px]"
            label="ประเภทการแจ้งเตือน"
            placeholder="เลือกประเภท"
            value={type}
            onChange={handleTypeChange}
            options={typeOptions}
          />
          <Input
            type="date"
            size="md"
            className="w-[180px]"
            label="วันที่เริ่มต้น"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => handleDateFromChange(event.target.value)}
          />
          <Input
            type="date"
            size="md"
            className="w-[180px]"
            label="วันที่สิ้นสุด"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => handleDateToChange(event.target.value)}
          />
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Search size={16} />
            ค้นหา
          </button>
        </div>

        {!loading && errorMessage && items.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
            <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF944D]/10"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <div className="overflow-x-auto" aria-busy={loading}>
          <table className="w-full min-w-[1240px]">
            <thead>
              <tr>
                {[
                  "ลำดับ",
                  "วันที่ส่ง",
                  "หัวข้อ",
                  "ประเภท",
                  "ผู้รับทั้งหมด",
                  "ส่งสำเร็จ",
                  "ส่งไม่สำเร็จ",
                  "เปิดอ่าน",
                  "ยังไม่อ่าน",
                  "Log",
                  "จัดการ",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && !hasLoadedOnce ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <NotificationBroadcastSkeleton key={index} />
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <ErrorState
                      message={errorMessage}
                      onRetry={() => void refetch()}
                    />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-sm text-[#9CA3AF]"
                  >
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.broadcastId}
                    className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
                      {formatDateTime(item.date)}
                    </td>
                    <td className="max-w-[280px] px-4 py-4 text-center text-sm text-gray-600">
                      <span className="line-clamp-2">{item.title || "-"}</span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {getTypeLabel(item.type)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {formatNumber(getTotalRecipients(item))}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-[#38B66A]">
                      {formatNumber(item.totalSent)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-[#F44034]">
                      {formatNumber(item.totalFailed)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
                      {formatReadCount(item.totalRead, item.totalSent)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {formatNumber(item.totalUnread)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <ActionIconButton
                          icon={ClipboardList}
                          variant="accent"
                          onClick={() => setLogBroadcast(item)}
                          aria-label={`ดู log ${item.title}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <ActionIconButton
                          icon={Search}
                          variant="primary"
                          onClick={() => handleOpenDetail(item)}
                          aria-label={`ดูรายละเอียด ${item.title}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          current={items.length}
          total={meta.total}
          page={meta.page}
          totalPages={meta.totalPages}
          pageSize={meta.limit}
          onPageChange={(page) =>
            setAppliedFilter((current) => ({ ...current, page }))
          }
        />
      </div>

      <NotificationBroadcastDetailModal
        broadcast={selectedBroadcast}
        source={selectedContent}
        product={selectedProduct}
        previewLoading={previewLoading}
        onClose={handleCloseDetail}
      />

      <BroadcastLogModal
        broadcast={logBroadcast}
        onClose={() => setLogBroadcast(null)}
      />
    </div>
  );
}

function NotificationBroadcastSkeleton() {
  return (
    <tr className="animate-pulse border-b border-[#F5F5F5]">
      {[
        "w-6",
        "w-28",
        "w-44",
        "w-16",
        "w-16",
        "w-16",
        "w-16",
        "w-24",
        "w-16",
        "w-8",
        "w-8",
      ].map((width, index) => (
        <td key={index} className="px-4 py-4">
          <div className={`mx-auto h-4 rounded bg-gray-100 ${width}`} />
        </td>
      ))}
    </tr>
  );
}

function NotificationBroadcastDetailModal({
  broadcast,
  source,
  product,
  previewLoading,
  onClose,
}: {
  broadcast: NotificationBroadcast | null;
  source: Content | null;
  product: Product | null;
  previewLoading: boolean;
  onClose: () => void;
}) {
  if (!broadcast) return null;

  const previewContent = getNotificationPreviewContent(
    broadcast,
    source,
    product,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-broadcast-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="ปิด"
      />
      <div className="relative max-h-[calc(100vh-48px)] w-[560px] max-w-full overflow-y-auto rounded-[24px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-[#FF944D]"
          aria-label="ปิด"
        >
          <XCircle size={18} fill="#FF944D" className="text-white" />
        </button>

        <h2
          id="notification-broadcast-detail-title"
          className="pr-6 text-[18px] font-bold leading-6 text-[#243333]"
        >
          รายละเอียดการแจ้งเตือน
        </h2>

        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <ModalInfo label="วันที่ส่ง" value={formatDateTime(broadcast.date)} />
            <ModalInfo label="ประเภท" value={getTypeLabel(broadcast.type)} />
            <ModalInfo
              label="ผู้รับทั้งหมด"
              value={formatNumber(getTotalRecipients(broadcast))}
            />
            <ModalInfo
              label="ส่งสำเร็จ"
              value={formatNumber(broadcast.totalSent)}
            />
            <ModalInfo
              label="ส่งไม่สำเร็จ"
              value={formatNumber(broadcast.totalFailed)}
            />
            <ModalInfo
              label="เปิดอ่าน"
              value={formatReadCount(broadcast.totalRead, broadcast.totalSent)}
            />
            <ModalInfo
              label="ยังไม่อ่าน"
              value={formatNumber(broadcast.totalUnread)}
            />
          </div>

          <ModalInfo label="หัวข้อ" value={broadcast.title || "-"} />
          <ModalInfo label="รายละเอียด" value={broadcast.body || "-"} />
          {previewLoading ? (
            <div className="h-[108px] animate-pulse rounded-[14px] bg-[#E8ECEE]" />
          ) : (
            <NotificationPreviewCard
              platform="android"
              content={previewContent}
              variant="compact"
              expandToContent
            />
          )}
        </div>
      </div>
    </div>
  );
}

function getNotificationPreviewContent(
  broadcast: NotificationBroadcast,
  source?: Content | null,
  product?: Product | null,
): NotificationPreviewContent {
  if (product) {
    return buildContentNotificationPreview(product, "product");
  }

  if (source) {
    return buildContentNotificationPreview(source, "news");
  }

  const parsedBody = parseNotificationBody(broadcast.body);

  return {
    title: broadcast.title || "แจ้งเตือนระบบ",
    compactBody: normalizeNotificationText(broadcast.body) || undefined,
    reference: parsedBody.reference,
    details:
      parsedBody.details.length > 0
        ? parsedBody.details.map((text) => ({ text }))
        : undefined,
  };
}

function parseNotificationBody(value: string) {
  const parts = value.split(/\n?─{3,}\n?/);
  const reference = parts.shift()?.trim() || undefined;
  const details = parts
    .join("\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return { reference, details };
}

function normalizeNotificationText(value: string) {
  return value.replace(/─{3,}/g, " ").replace(/\s+/g, " ").trim();
}

function getSourceIdFromDeepLink(broadcast: NotificationBroadcast) {
  if (!broadcast.deepLink) return undefined;

  const pattern =
    broadcast.type === "PRODUCT"
      ? /\/(?:products?|policies)\/([^/?#]+)/i
      : /\/news\/([^/?#]+)/i;
  const sourceId = broadcast.deepLink.match(pattern)?.[1];

  if (!sourceId) return undefined;
  try {
    return decodeURIComponent(sourceId);
  } catch {
    return sourceId;
  }
}

async function loadProductSource(
  broadcast: NotificationBroadcast,
  productId?: string,
) {
  if (productId) {
    const response = await productApi.getById(productId);
    return response.success ? response.data : null;
  }

  const title = broadcast.body.split(/\r?\n/, 1)[0]?.trim();
  if (!title) return null;

  const response = await productApi.getAll({ keyword: title, page: 1, limit: 10 });
  if (!response.success) return null;

  return (
    response.data.find(
      (product) =>
        product.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase(),
    ) ?? response.data[0] ?? null
  );
}

async function loadContentSource(
  broadcast: NotificationBroadcast,
  contentId?: string,
) {
  if (contentId) {
    const response = await contentApi.getById(contentId);
    return response.success ? response.data : null;
  }

  const response = await contentApi.getAll({ page: 1, limit: 100 });
  if (!response.success) return null;

  const expectedBody = normalizeComparableText(broadcast.body);
  const expectedTitle = normalizeComparableText(broadcast.title);
  const exactMatch = response.data.find((content) => {
    const preview = buildContentNotificationPreview(content, "news");
    const body = buildContentNotificationBody(content, "news", preview);
    return (
      normalizeComparableText(preview.title) === expectedTitle &&
      normalizeComparableText(body) === expectedBody
    );
  });

  if (exactMatch) return exactMatch;

  const rankedMatches = response.data
    .map((content) => {
      const normalizedTitle = normalizeComparableText(content.title);
      const normalizedSummary = normalizeComparableText(content.summary || "");
      let score = 0;
      if (normalizedTitle && expectedBody.includes(normalizedTitle)) score += 3;
      if (normalizedSummary && expectedBody.includes(normalizedSummary)) score += 2;
      return { content, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return rankedMatches[0]?.content ?? null;
}

function normalizeComparableText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function ModalInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold leading-5 text-[#243333]">{label}</p>
      <p className="whitespace-pre-wrap break-words text-[13px] leading-5 text-[#9FA2A9]">
        {value}
      </p>
    </div>
  );
}

function getTotalRecipients(broadcast: NotificationBroadcast) {
  return broadcast.totalSent + broadcast.totalFailed;
}

function getTypeLabel(type: NotificationBroadcastType) {
  const labels: Record<NotificationBroadcastType, string> = {
    SYSTEM: "ระบบ",
    PRODUCT: "ผลิตภัณฑ์",
    NEWS: "ข่าวสาร / โปรโมชั่น",
  };
  return labels[type] ?? type;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function formatReadCount(readCount: number, totalSent: number) {
  if (totalSent <= 0) return formatNumber(readCount);
  const percent = (readCount / totalSent) * 100;
  const formattedPercent = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 1,
  }).format(percent);
  return `${formatNumber(readCount)} (${formattedPercent}%)`;
}

function BroadcastLogModal({
  broadcast,
  onClose,
}: {
  broadcast: NotificationBroadcast | null;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [appliedPhone, setAppliedPhone] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const { data, loading, errorMessage, refetch } = useAsyncData(async () => {
    if (!broadcast) return null;
    const res = await notificationApi.getBroadcastLogs(
      broadcast.broadcastId,
      page,
      20,
      appliedStatus || undefined,
      appliedPhone.trim() || undefined,
    );
    if (!res.success) throw new Error("โหลด log ไม่สำเร็จ");
    return res;
  });

  useEffect(() => {
    if (broadcast) void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcast, page, appliedStatus, appliedPhone]);

  if (!broadcast) return null;

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const applyFilters = () => {
    setPage(1);
    setAppliedPhone(phone);
    setAppliedStatus(status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    setAppliedStatus(value);
  };

  const handleClose = () => {
    setPage(1);
    setPhone("");
    setStatus("");
    setAppliedPhone("");
    setAppliedStatus("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-[#243333]/20 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-log-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="ปิด"
      />
      <div className="relative max-h-[calc(100vh-48px)] w-full max-w-[980px] overflow-y-auto rounded-[24px] bg-white px-8 py-8 shadow-[0_12px_40px_rgba(36,51,51,0.14)] sm:px-10">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-7 top-7 flex h-8 w-8 items-center justify-center rounded-full text-[#607078] transition-colors hover:bg-[#F3F6F6] hover:text-[#243333]"
          aria-label="ปิด"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <h2
          id="broadcast-log-modal-title"
          className="pr-12 text-[22px] font-bold leading-7 text-[#243333]"
        >
          ประวัติ Log การส่ง
        </h2>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">
          แสดงประวัติการส่งข้อความแจ้งเตือนของหัวข้อที่เลือก
        </p>

        <div className="mt-6 flex items-center gap-4 rounded-[10px] bg-gradient-to-r from-[#F0FAFA] to-[#F7FCFC] px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF1DF] text-[#FF9D2E]">
            <TriangleAlert size={22} fill="currentColor" className="text-[#FF9D2E]" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-[#9CA3AF]">หัวข้อข้อความ</p>
            <p className="truncate text-[14px] font-bold text-[#243333]">
              {broadcast.title || "-"}
            </p>
            <p className="mt-0.5 text-[12px] text-[#8C9A9F]">
              ประเภท: {getTypeLabel(broadcast.type)}
              <span className="mx-2 text-[#D7DEDE]">|</span>
              วันที่ส่ง: {formatDateTime(broadcast.date)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LogSummaryCard
            icon={Users}
            label="ผู้รับทั้งหมด"
            value={getTotalRecipients(broadcast)}
            iconClassName="bg-[#EDF8FF] text-[#2D9CDB]"
          />
          <LogSummaryCard
            icon={Check}
            label="ส่งสำเร็จ"
            value={broadcast.totalSent}
            iconClassName="bg-[#EAF9F1] text-[#13AE70]"
          />
          <LogSummaryCard
            icon={X}
            label="ส่งไม่สำเร็จ"
            value={broadcast.totalFailed}
            iconClassName="bg-[#FFF0F0] text-[#F04444]"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Input
            size="md"
            className="w-full sm:w-[360px]"
            label="เบอร์โทรศัพท์"
            placeholder="ค้นหาจากเบอร์โทรศัพท์ผู้ใช้"
            icon={<Search size={16} />}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") applyFilters(); }}
          />
          <Select
            size="md"
            className="w-full sm:w-[240px]"
            label="สถานะการส่ง"
            placeholder="เลือกสถานะ"
            value={status}
            onChange={handleStatusChange}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: "ส่งสำเร็จ", value: "SENT" },
              { label: "ส่งไม่สำเร็จ", value: "FAILED" },
            ]}
          />
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-[42px] items-center gap-2 self-end rounded-[10px] bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Search size={16} />
            ค้นหา
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[10px] border border-[#F1F3F3]">
          <table className="w-full min-w-[760px]">
            <thead className="bg-[#FAFBFB]">
              <tr>
                {["ลำดับ", "วันที่ / เวลา", "ผู้รับ", "Device ID", "สถานะ", "รายละเอียด"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[12px] font-semibold text-[#87959B]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-[#F5F5F5]">
                    {["w-6", "w-24", "w-20", "w-16", "w-32", "w-28"].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-3 rounded bg-gray-100 ${w}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#F44034]">{errorMessage}</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#9CA3AF]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#EEF1F1] last:border-b-0 hover:bg-primary/[0.02]"
                  >
                    <td className="px-4 py-3 text-center text-[12px] text-[#64757B]">
                      {((page - 1) * 20) + i + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#64757B]">
                      {formatDateTime(log.sentAt ?? log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#64757B]">
                      {log.phone ?? "-"}
                    </td>
                    <td className="max-w-[150px] px-4 py-3 text-[12px] text-[#64757B]">
                      <span className="block truncate" title={log.deviceId}>
                        {formatCompactId(log.deviceId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <LogStatusBadge status={log.status} />
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-[12px] text-[#64757B]">
                      <span className="line-clamp-2">
                        {getLogDetail(log.status, log.errorMessage)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-[6px] border border-[#EAEAEA] px-3 py-1 text-xs disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span className="text-xs text-gray-500">{page} / {meta.totalPages}</span>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-[6px] border border-[#EAEAEA] px-3 py-1 text-xs disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LogStatusBadge({ status }: { status: BroadcastLogStatus }) {
  const config: Record<BroadcastLogStatus, { label: string; className: string }> = {
    SENT: { label: "ส่งสำเร็จ", className: "bg-[#ECFDF3] text-[#38B66A]" },
    FAILED: { label: "ส่งไม่สำเร็จ", className: "bg-[#FEF2F2] text-[#F44034]" },
    PENDING: { label: "รอส่ง", className: "bg-[#FFF7ED] text-[#FF944D]" },
  };
  const { label, className } = config[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function LogSummaryCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  iconClassName: string;
}) {
  return (
    <div className="flex min-h-[82px] items-center gap-4 rounded-[10px] border border-[#E5E9E9] bg-white px-4 shadow-[0_2px_8px_rgba(36,51,51,0.03)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[12px] text-[#8C9A9F]">{label}</p>
        <p className="text-[20px] font-bold leading-6 text-[#243333]">
          {formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

function formatCompactId(value: string) {
  if (!value) return "-";
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function getLogDetail(status: BroadcastLogStatus, errorMessage: string | null) {
  if (errorMessage) return errorMessage;
  if (status === "SENT") return "ส่งข้อความสำเร็จ";
  if (status === "PENDING") return "กำลังรอส่งข้อความ";
  return "ไม่พบรายละเอียดข้อผิดพลาด";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
