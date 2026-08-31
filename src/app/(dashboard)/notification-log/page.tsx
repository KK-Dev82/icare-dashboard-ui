"use client";

import { useEffect, useRef, useState } from "react";
import { Search, XCircle } from "lucide-react";
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
import type { Product } from "@/types/product";
import type {
  NotificationLog,
  NotificationLogFilter,
  NotificationLogStatus,
  NotificationLogType,
} from "@/types/notification-log";

const defaultMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const typeOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "ระบบ", value: "SYSTEM" },
  { label: "ผลิตภัณฑ์", value: "PRODUCT" },
  { label: "ข่าวสาร", value: "NEWS" },
];

const statusOptions = [
  { label: "ทั้งหมด", value: "" },
  { label: "ส่งสำเร็จ", value: "SENT" },
  { label: "ล้มเหลว", value: "FAILED" },
];

const initialFilter: NotificationLogFilter = { page: 1, limit: 10 };

export default function NotificationLogPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestRef = useRef(0);
  const [appliedFilter, setAppliedFilter] =
    useState<NotificationLogFilter>(initialFilter);

  const {
    data: listData,
    loading,
    errorMessage,
    refetch,
    hasLoadedOnce,
  } = useAsyncData(async () => {
    const response = await notificationApi.getLogs(appliedFilter);
    if (response.success === false) {
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

  const handleSearch = () => {
    setAppliedFilter({
      search: search.trim() || undefined,
      type: (type || undefined) as NotificationLogType | undefined,
      status: (status || undefined) as NotificationLogStatus | undefined,
      page: 1,
      limit: appliedFilter.limit,
    });
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    setAppliedFilter((current) => ({
      ...current,
      type: (value || undefined) as NotificationLogType | undefined,
      page: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setAppliedFilter((current) => ({
      ...current,
      status: (value || undefined) as NotificationLogStatus | undefined,
      page: 1,
    }));
  };

  const handleOpenDetail = (item: NotificationLog) => {
    const requestId = ++previewRequestRef.current;
    const contentId = getContentId(item);
    const productId = getProductId(item);
    const isNews = item.type?.toUpperCase() === "NEWS";
    const isProduct = ["POLICY", "PRODUCT"].includes(
      item.type?.toUpperCase() ?? "",
    );

    setSelectedLog(item);
    setSelectedContent(null);
    setSelectedProduct(isProduct ? item.product ?? null : null);

    if (isProduct && item.product) {
      setPreviewLoading(false);
      return;
    }

    if (isProduct) {
      setPreviewLoading(true);
      void loadProductSource(item, productId)
        .then((product) => {
          if (previewRequestRef.current === requestId && product) {
            setSelectedProduct(product);
          }
        })
        .catch(() => {
          // Keep the stored notification detail when the product was removed.
        })
        .finally(() => {
          if (previewRequestRef.current === requestId) {
            setPreviewLoading(false);
          }
        });
      return;
    }

    if (!isNews) {
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    void loadContentSource(item, contentId)
      .then((content) => {
        if (previewRequestRef.current === requestId && content) {
          setSelectedContent(content);
        }
      })
      .catch(() => {
        // Keep the stored notification preview when the source no longer exists.
      })
      .finally(() => {
        if (previewRequestRef.current === requestId) {
          setPreviewLoading(false);
        }
      });
  };

  const handleCloseDetail = () => {
    previewRequestRef.current += 1;
    setSelectedLog(null);
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
            แสดงประวัติการส่งข้อความแจ้งเตือนของระบบ
          </p>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <Input
            size="md"
            className="w-[280px]"
            label="ค้นหา"
            placeholder="ค้นหาหัวข้อ"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="ประเภทการแจ้งเตือน"
            placeholder="เลือกประเภท"
            value={type}
            onChange={handleTypeChange}
            options={typeOptions}
          />
          <Select
            size="md"
            className="w-[200px]"
            label="สถานะการส่ง"
            placeholder="เลือกสถานะ"
            value={status}
            onChange={handleStatusChange}
            options={statusOptions}
          />
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
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr>
                {[
                  "ลำดับ",
                  "วันที่ส่ง",
                  "หัวข้อ",
                  "ประเภท",
                  "ส่งสำเร็จ",
                  "เปิดอ่าน",
                  "สถานะ",
                  "ผู้ส่ง",
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
                  <NotificationLogSkeleton key={index} />
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <ErrorState
                      message={errorMessage}
                      onRetry={() => void refetch()}
                    />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-sm text-[#9CA3AF]"
                  >
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const successCount = getSuccessCount(item);
                  const readCount = getReadCount(item);
                  const totalCount = getTotalCount(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {(meta.page - 1) * meta.limit + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
                        {formatDateTime(item.sentAt || item.createdAt)}
                      </td>
                      <td className="max-w-[280px] px-4 py-4 text-center text-sm text-gray-600">
                        <span className="line-clamp-2">{item.title || "-"}</span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {getTypeLabel(item.type)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {formatNumber(successCount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
                        {formatReadCount(readCount, totalCount)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold">
                        <StatusLabel log={item} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-600">
                        {getSenderName(item)}
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
          onPageChange={(page) =>
            setAppliedFilter((current) => ({ ...current, page }))
          }
        />
      </div>

      <NotificationLogDetailModal
        log={selectedLog}
        source={selectedContent}
        product={selectedProduct}
        previewLoading={previewLoading}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

function NotificationLogSkeleton() {
  return (
    <tr className="animate-pulse border-b border-[#F5F5F5]">
      {["w-6", "w-28", "w-44", "w-16", "w-16", "w-24", "w-16", "w-24", "w-8"].map(
        (width, index) => (
          <td key={index} className="px-4 py-4">
            <div className={`mx-auto h-4 rounded bg-gray-100 ${width}`} />
          </td>
        ),
      )}
    </tr>
  );
}

function StatusLabel({ log }: { log: NotificationLog }) {
  const status = getStatus(log);
  const styles: Record<string, string> = {
    SUCCESS: "text-[#38B66A]",
    PARTIAL: "text-[#FF944D]",
    PENDING: "text-[#FF944D]",
    SCHEDULED: "text-[#3B82F6]",
    FAILED: "text-[#F44034]",
  };
  const labels: Record<string, string> = {
    SUCCESS: "ส่งสำเร็จ",
    PARTIAL: "สำเร็จบางส่วน",
    PENDING: "รอส่ง",
    SCHEDULED: "ตั้งเวลาส่ง",
    FAILED: "ล้มเหลว",
  };

  return (
    <span className={styles[status] ?? "text-gray-500"}>
      {labels[status] ?? status ?? "-"}
    </span>
  );
}

function NotificationLogDetailModal({
  log,
  source,
  product,
  previewLoading,
  onClose,
}: {
  log: NotificationLog | null;
  source: Content | null;
  product: Product | null;
  previewLoading: boolean;
  onClose: () => void;
}) {
  if (!log) return null;

  const totalCount = getTotalCount(log);
  const successCount = getSuccessCount(log);
  const readCount = getReadCount(log);
  const previewContent = getNotificationPreviewContent(log, source, product);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-log-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="ปิด"
      />
      <div className="relative max-h-[calc(100vh-48px)] w-[520px] max-w-full overflow-y-auto rounded-[24px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-[#FF944D]"
          aria-label="ปิด"
        >
          <XCircle size={18} fill="#FF944D" className="text-white" />
        </button>

        <h2
          id="notification-log-detail-title"
          className="pr-6 text-[18px] font-bold leading-6 text-[#243333]"
        >
          รายละเอียดการแจ้งเตือน
        </h2>

        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <ModalInfo
              label="วันที่ส่ง"
              value={formatDateTime(log.sentAt || log.createdAt)}
            />
            <ModalInfo label="หัวข้อ" value={log.title || "-"} />
            <ModalInfo label="ส่งสำเร็จ" value={formatNumber(successCount)} />
            <ModalInfo label="เปิดอ่าน" value={formatReadCount(readCount, totalCount)} />
            <div>
              <p className="text-[12px] font-semibold leading-5 text-[#243333]">
                สถานะ
              </p>
              <p className="text-[13px] font-semibold leading-5">
                <StatusLabel log={log} />
              </p>
            </div>
            <ModalInfo label="ผู้ส่ง" value={getSenderName(log)} />
          </div>

          <NotificationDetail log={log} product={product} />

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
  log: NotificationLog,
  source?: Content | null,
  product?: Product | null,
): NotificationPreviewContent {
  if (product) {
    return buildContentNotificationPreview(product, "product");
  }

  if (source) {
    return buildContentNotificationPreview(source, "news");
  }

  const payload = getNotificationPayload(log);
  const body = payload.body || payload.bodyRich || "";
  const parsedBody = parseNotificationBody(body);

  return {
    title: payload.title || "แจ้งเตือนระบบ",
    compactBody: normalizeNotificationText(body) || undefined,
    reference: parsedBody.reference,
    details:
      parsedBody.details.length > 0
        ? parsedBody.details.map((text) => ({ text }))
        : undefined,
    image: payload.imageUrl || undefined,
    imageAlt: log.title || "รูปภาพการแจ้งเตือน",
  };
}

function getNotificationDetail(log: NotificationLog) {
  const payload = getNotificationPayload(log);
  return payload.bodyRich || payload.body || "-";
}

function getContentId(log: NotificationLog) {
  return (
    log.contentId ||
    log.payload?.contentId ||
    log.data?.contentId ||
    log.metadata?.contentId ||
    undefined
  );
}

function getProductId(log: NotificationLog) {
  return (
    log.productId ||
    log.payload?.productId ||
    log.data?.productId ||
    log.metadata?.productId ||
    undefined
  );
}

async function loadProductSource(
  log: NotificationLog,
  productId?: string,
) {
  if (productId) {
    const response = await productApi.getById(productId);
    return response.success ? response.data : null;
  }

  const payload = getNotificationPayload(log);
  const title = payload.body?.split(/\r?\n/, 1)[0]?.trim();
  if (!title) return null;

  const response = await productApi.getAll({ keyword: title, page: 1, limit: 10 });
  if (!response.success) return null;

  return (
    response.data.find(
      (product) => product.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase(),
    ) ?? response.data[0] ?? null
  );
}

async function loadContentSource(
  log: NotificationLog,
  contentId?: string,
) {
  if (contentId) {
    const response = await contentApi.getById(contentId);
    return response.success ? response.data : null;
  }

  const response = await contentApi.getAll({ page: 1, limit: 100 });
  if (!response.success) return null;

  const payload = getNotificationPayload(log);
  const expectedBody = normalizeComparableText(payload.body || payload.bodyRich || "");
  const expectedTitle = normalizeComparableText(payload.title || log.title);

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

function getNotificationPayload(log: NotificationLog) {
  return {
    title:
      log.payload?.title ||
      log.data?.title ||
      log.metadata?.title ||
      log.title,
    body:
      log.payload?.body ||
      log.data?.body ||
      log.metadata?.body ||
      log.body,
    bodyRich:
      log.payload?.bodyRich ||
      log.data?.bodyRich ||
      log.metadata?.bodyRich ||
      log.bodyRich,
    imageUrl:
      log.payload?.imageUrl ||
      log.data?.imageUrl ||
      log.metadata?.imageUrl ||
      log.imageUrl,
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

function NotificationDetail({
  log,
  product,
}: {
  log: NotificationLog;
  product: Product | null;
}) {
  if (!product) {
    return <ModalInfo label="รายละเอียด" value={getNotificationDetail(log)} />;
  }

  return (
    <div>
      <p className="text-[12px] font-semibold leading-5 text-[#243333]">
        รายละเอียด
      </p>
      <div className="mt-1 space-y-3 break-words text-[13px] leading-6 text-[#9FA2A9]">
        {product.summary && <p className="whitespace-pre-wrap">{product.summary}</p>}
        {product.summary &&
          (product.content || (product.coverages ?? []).length > 0) && (
            <div className="w-[168px] border-t border-[#B8BEC1]" aria-hidden="true" />
          )}
        {product.content && <ProductDetailContent value={product.content} />}
        {(product.coverages ?? []).length > 0 && (
          <ul className="space-y-1.5">
            {(product.coverages ?? []).map((coverage, index) => (
              <li key={`${coverage}-${index}`} className="flex items-start gap-2">
                <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-[#9FA2A9]" />
                <span>{coverage}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProductDetailContent({ value }: { value: string }) {
  if (/<\/?[a-z][^>]*>/i.test(value)) {
    return (
      <div
        className="max-w-none whitespace-normal break-words [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-1 [&_p]:whitespace-pre-wrap [&_ul]:space-y-1"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return <p className="whitespace-pre-wrap break-words">{value}</p>;
}

function ModalInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold leading-5 text-[#243333]">{label}</p>
      <p className="whitespace-pre-wrap text-[13px] leading-5 text-[#9FA2A9]">
        {value}
      </p>
    </div>
  );
}

function getTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    SYSTEM: "ระบบ",
    POLICY: "ผลิตภัณฑ์",
    PRODUCT: "ผลิตภัณฑ์",
    NEWS: "ข่าวสาร",
    CONTENT: "ข่าวสาร",
  };
  return type ? labels[type.toUpperCase()] ?? type : "-";
}

function getStatus(log: NotificationLog) {
  const rawStatus = log.status?.toUpperCase();
  if (rawStatus === "COMPLETED" || rawStatus === "SENT") return "SUCCESS";
  if (rawStatus) return rawStatus;

  const failedCount =
    firstNumber(log.failedCount, log.failureCount, log.failed) ?? 0;
  const successCount = getSuccessCount(log);
  if (successCount > 0 && failedCount > 0) return "PARTIAL";
  if (failedCount > 0 && successCount === 0) return "FAILED";
  return "SUCCESS";
}

function getSuccessCount(log: NotificationLog) {
  return firstNumber(log.successCount, log.sentCount, log.success) ?? 0;
}

function getReadCount(log: NotificationLog) {
  return firstNumber(log.readCount, log.openedCount, log.read) ?? 0;
}

function getTotalCount(log: NotificationLog) {
  const explicitTotal = firstNumber(
    log.totalRecipients,
    log.totalDevices,
    log.targetCount,
    log.recipientCount,
    log.total,
  );
  if (explicitTotal !== undefined) return explicitTotal;
  return (
    getSuccessCount(log) +
    (firstNumber(log.failedCount, log.failureCount, log.failed) ?? 0)
  );
}

function getSenderName(log: NotificationLog) {
  return (
    log.senderName ||
    log.createdByName ||
    log.sender?.fullName ||
    log.sender?.name ||
    log.sender?.username ||
    log.admin?.fullName ||
    log.admin?.name ||
    log.admin?.username ||
    log.createdByAdmin?.fullName ||
    log.createdByAdmin?.name ||
    log.createdByAdmin?.username ||
    log.createdBy ||
    "-"
  );
}

function firstNumber(...values: Array<number | null | undefined>) {
  return values.find((value): value is number => typeof value === "number");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function formatReadCount(readCount: number, totalCount: number) {
  if (totalCount <= 0) return formatNumber(readCount);
  const percent = (readCount / totalCount) * 100;
  const formattedPercent = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 1,
  }).format(percent);
  return `${formatNumber(readCount)} (${formattedPercent}%)`;
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
