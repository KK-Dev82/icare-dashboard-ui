"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { dashboardApi } from "@/api/dashboard";
import { ErrorState } from "@/components/ui/error-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAsyncData } from "@/hooks/useAsyncData";
import type {
  ApiActivityItem,
  ApiActivityOutcome,
} from "@/types/dashboard";

const PAGE_SIZE = 10;
const defaultMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  startDate: "",
  endDate: "",
};

const outcomeTabs: Array<{ label: string; value: ApiActivityOutcome }> = [
  { label: "Success", value: "success" },
  { label: "Error", value: "error" },
];

export default function ApiActivityPage() {
  const [outcome, setOutcome] = useState<ApiActivityOutcome>("success");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: listData,
    loading,
    errorMessage,
    refetch,
    hasLoadedOnce,
  } = useAsyncData(async () => {
    try {
      const response = await dashboardApi.getApiActivity({
        outcome,
        page,
        limit: PAGE_SIZE,
      });

      return {
        outcome,
        items: Array.isArray(response.data) ? response.data : [],
        meta: response.meta ?? defaultMeta,
      };
    } catch (error) {
      throw new Error(getApiActivityErrorMessage(error));
    }
  });

  const isCurrentResult = listData?.outcome === outcome;
  const items = isCurrentResult ? listData.items : [];
  const meta = isCurrentResult ? listData.meta : defaultMeta;

  useEffect(() => {
    void refetch();
    // refetch is stable and the request is intentionally driven by the active tab and page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, page]);

  const handleOutcomeChange = (nextOutcome: ApiActivityOutcome) => {
    if (nextOutcome === outcome) return;
    setOutcome(nextOutcome);
    setPage(1);
    setExpandedId(null);
  };

  const handleRefresh = async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <section className="flex min-h-[620px] w-full flex-col rounded-[18px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Activity</h1>
            <p className="mt-1 text-sm text-gray-400">Debug console</p>
          </div>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            aria-disabled={loading}
            className="flex h-10 shrink-0 items-center gap-2 rounded-[8px] bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            รีเฟรช
          </button>
        </header>

        <div
          className="mt-4 grid w-full max-w-[320px] grid-cols-2 gap-3"
          role="tablist"
          aria-label="เลือกประเภท API Activity"
        >
          {outcomeTabs.map((tab) => {
            const active = tab.value === outcome;
            const successTab = tab.value === "success";
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleOutcomeChange(tab.value)}
                className={`h-10 rounded-[8px] border text-sm font-semibold transition-colors ${
                  active
                    ? successTab
                      ? "border-primary bg-primary text-white"
                      : "border-error bg-error text-white"
                    : successTab
                      ? "border-primary/60 text-primary hover:bg-primary/5"
                      : "border-error/60 text-error hover:bg-error/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-x-auto" aria-busy={loading}>
          <table className="w-full min-w-[680px] table-fixed">
            <caption className="sr-only">
              รายการ API Activity ประเภท {outcome}
            </caption>
            <thead className="sr-only">
              <tr>
                <th>เวลา</th>
                <th>Method</th>
                <th>Route</th>
                <th>Status</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {loading && (!hasLoadedOnce || !isCurrentResult) ? (
                <ActivitySkeleton />
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message={errorMessage} onRetry={() => void refetch()} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-gray-400">
                    ไม่พบข้อมูล API Activity ในช่วง 24 ชั่วโมงล่าสุด
                  </td>
                </tr>
              ) : (
                items.map((activity) => {
                  const canExpand = activity.outcome === "error";
                  const isExpanded = canExpand && expandedId === activity.id;

                  return (
                    <Fragment key={activity.id}>
                      <tr className="border-b border-gray-100 transition-colors hover:bg-primary/[0.02]">
                        <td className="w-[20%] px-4 py-4 text-center text-sm text-gray-500">
                          {formatTime(activity.timestamp)}
                        </td>
                        <td className="w-[16%] px-4 py-4 text-center">
                          <span
                            className={`inline-flex min-w-[52px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getMethodClassName(activity.method)}`}
                          >
                            {formatMethod(activity.method)}
                          </span>
                        </td>
                        <td className="w-[42%] truncate px-4 py-4 text-sm text-gray-500" title={activity.route}>
                          {activity.route}
                        </td>
                        <td
                          className={`w-[14%] px-4 py-4 text-center text-sm font-semibold ${getStatusClassName(activity.statusCode)}`}
                        >
                          {activity.statusCode || "-"}
                        </td>
                        <td className="w-[8%] px-2 py-4 text-center">
                          {canExpand && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "ซ่อนรายละเอียด Log" : "แสดงรายละเอียด Log"}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            >
                              <ChevronDown
                                size={17}
                                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                          <td colSpan={5} className="px-8 py-4">
                            <p className="mb-1 text-xs font-semibold text-gray-500">Log line</p>
                            <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-5 text-gray-600">
                              {getActivityLogLine(activity)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {items.length > 0 && (
          <TablePagination
            current={items.length}
            total={meta.total}
            page={meta.page}
            totalPages={Math.max(
              1,
              Math.min(meta.totalPages, Math.floor(5000 / meta.limit)),
            )}
            pageSize={meta.limit}
            onPageChange={(nextPage) => {
              if (loading) return;
              setPage(nextPage);
              setExpandedId(null);
            }}
            className={loading ? "pointer-events-none opacity-60" : ""}
          />
        )}
      </section>
    </div>
  );
}

function ActivitySkeleton() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse border-b border-gray-100">
      <td className="px-4 py-5"><div className="mx-auto h-4 w-16 rounded bg-gray-100" /></td>
      <td className="px-4 py-5"><div className="mx-auto h-6 w-14 rounded-full bg-gray-100" /></td>
      <td className="px-4 py-5"><div className="h-4 w-4/5 rounded bg-gray-100" /></td>
      <td className="px-4 py-5"><div className="mx-auto h-4 w-10 rounded bg-gray-100" /></td>
      <td className="px-2 py-5"><div className="mx-auto h-6 w-6 rounded-full bg-gray-100" /></td>
    </tr>
  ));
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--:--";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replaceAll(":", " : ");
}

function formatMethod(method: string) {
  const normalized = method.trim().toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getMethodClassName(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-50 text-blue-500";
    case "POST":
      return "bg-green-50 text-green-500";
    case "PUT":
    case "PATCH":
      return "bg-amber-50 text-amber-600";
    case "DELETE":
      return "bg-red-50 text-error";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function getStatusClassName(statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) return "text-green-500";
  if (statusCode >= 400) return "text-error";
  if (statusCode >= 300) return "text-amber-600";
  return "text-gray-400";
}

function getActivityLogLine(activity: ApiActivityItem) {
  if (activity.logLine) {
    try {
      const formatted = JSON.stringify(JSON.parse(activity.logLine), null, 2);
      if (formatted) return formatted;
    } catch {
      return activity.logLine;
    }
  }

  return JSON.stringify(
    {
      timestamp: activity.timestamp,
      requestId: activity.requestId,
      method: activity.method,
      route: activity.route,
      status: activity.statusCode,
      response: activity.response,
    },
    null,
    2,
  );
}

function getApiActivityErrorMessage(error: unknown) {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { message?: string | string[] };
      };
    }
  ).response;
  const status = response?.status;
  const rawMessage = response?.data?.message;
  const responseMessage = Array.isArray(rawMessage)
    ? rawMessage.join(", ")
    : rawMessage;

  if (status === 503) return "API activity is temporarily unavailable";
  if (status === 403) return "ไม่มีสิทธิ์เข้าถึง API Activity";
  if (status === 401) return "กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
  if (status === 400) return responseMessage || "พารามิเตอร์หรือช่วงวันที่ไม่ถูกต้อง";

  return responseMessage || (error instanceof Error ? error.message : "โหลด API Activity ไม่สำเร็จ");
}
