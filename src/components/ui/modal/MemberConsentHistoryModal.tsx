"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { consentApi } from "@/api/consent";
import { ErrorState } from "@/components/ui/error-state";
import { TablePagination } from "@/components/ui/table-pagination";
import type { ConsentUserAcceptance, PaginatedResponse } from "@/types/consent";

interface MemberConsentHistoryModalProps {
  open: boolean;
  userId: string;
  onClose: () => void;
}

const PAGE_SIZE = 10;
const emptyMeta = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

export function MemberConsentHistoryModal({
  open,
  userId,
  onClose,
}: MemberConsentHistoryModalProps) {
  const [items, setItems] = useState<ConsentUserAcceptance[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setErrorMessage("");

      consentApi
        .getUserConsents({ userId, page, limit: PAGE_SIZE })
        .then((response: PaginatedResponse<ConsentUserAcceptance>) => {
          if (cancelled) return;
          setItems(response.data);
          setMeta({
            ...response.meta,
            totalPages: Math.max(1, response.meta.totalPages),
          });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setItems([]);
          setMeta(emptyMeta);
          setErrorMessage(getErrorMessage(error));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, page, reloadKey, userId]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  });

  if (!open) return null;

  function handleClose() {
    setPage(1);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/25 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-consent-history-title"
    >
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="fixed inset-0 cursor-default"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-[760px] rounded-[20px] bg-white px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:px-8">
        <button
          type="button"
          onClick={handleClose}
          aria-label="ปิด"
          className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
        >
          <X size={14} strokeWidth={3} />
        </button>

        <header className="border-b border-[#EAEAEA] pb-4 pr-10">
          <h2
            id="member-consent-history-title"
            className="text-lg font-bold text-[#243333]"
          >
            ประวัติการยินยอมนโยบาย / PDPA
          </h2>
          <p className="mt-0.5 text-sm text-[#9CA3AF]">
            ข้อมูลประวัติการยินยอมนโยบายความเป็นส่วนตัว และ ข้อกำหนดการใช้งาน
          </p>
        </header>

        <div className="min-h-[260px]">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <LoaderCircle className="animate-spin text-primary" size={28} />
            </div>
          ) : errorMessage ? (
            <ErrorState
              message={errorMessage}
              onRetry={() => {
                setLoading(true);
                setReloadKey((current) => current + 1);
              }}
            />
          ) : items.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-[#9CA3AF]">
              ไม่พบประวัติการยินยอม
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed text-left">
                <thead>
                  <tr className="text-xs font-semibold text-[#9CA3AF]">
                    <th className="w-[12%] px-3 py-4">ลำดับ</th>
                    <th className="w-[34%] px-3 py-4">ชื่อรายการ</th>
                    <th className="w-[18%] px-3 py-4">รายละเอียด</th>
                    <th className="w-[14%] px-3 py-4">เวอร์ชัน</th>
                    <th className="w-[22%] px-3 py-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={`${item.policy.id}-${item.policy.version}-${item.acceptedAt}`}
                      className="border-t border-[#F0F0F0] text-sm text-[#657070]"
                    >
                      <td className="px-3 py-4">
                        {(meta.page - 1) * meta.limit + index + 1}
                      </td>
                      <td className="px-3 py-4 font-medium">
                        {item.policy.title}
                      </td>
                      <td className="px-3 py-4">-</td>
                      <td className="px-3 py-4">{item.policy.version}</td>
                      <td className="px-3 py-4">
                        <span className="block font-medium text-[#24A148]">
                          ยินยอม
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                          {formatConsentDate(item.acceptedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !errorMessage && (
          <TablePagination
            current={items.length}
            total={meta.total}
            page={meta.page}
            totalPages={meta.totalPages}
            pageSize={meta.limit}
            onPageChange={(nextPage) => {
              setLoading(true);
              setPage(nextPage);
            }}
            stickToBottom={false}
            className="border-t border-[#EAEAEA]"
          />
        )}
      </div>
    </div>
  );
}

function formatConsentDate(value: string) {
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type ApiError = { response?: { data?: { message?: string } } };

function getErrorMessage(error: unknown) {
  return (
    (error as ApiError)?.response?.data?.message ||
    (error instanceof Error ? error.message : "โหลดประวัติการยินยอมไม่สำเร็จ")
  );
}
