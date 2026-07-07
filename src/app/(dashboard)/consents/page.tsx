"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus } from "lucide-react";
import { consentApi } from "@/api/consent";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useToast } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { ConsentPolicy, ConsentStatus, ConsentType } from "@/types/consent";

const defaultMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const summaryCards = [
  { label: "ทั้งหมด", pillClass: "bg-primary text-white" },
  { label: "เผยแพร่", pillClass: "bg-[#24A148] text-white" },
  { label: "ร่าง", pillClass: "bg-[#FF944D] text-white" },
  { label: "เก็บถาวร", pillClass: "bg-[#707070] text-white" },
];

const statusConfig: Record<ConsentStatus, { label: string; color: string }> = {
  DRAFT: { label: "ร่าง", color: "#FF944D" },
  PUBLISHED: { label: "เผยแพร่", color: "#24A148" },
  ARCHIVED: { label: "เก็บถาวร", color: "#707070" },
};

interface AppliedParams {
  filterTypeId: string;
  filterStatus: string;
  page: number;
}

export default function ConsentsPage() {
  const router = useRouter();
  const toast = useToast();
  const toastRef = useRef(toast);
  const [types, setTypes] = useState<ConsentType[]>([]);
  const [filterTypeId, setFilterTypeId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [previewItem, setPreviewItem] = useState<ConsentPolicy | null>(null);
  const [appliedParams, setAppliedParams] = useState<AppliedParams>({
    filterTypeId: "",
    filterStatus: "",
    page: 1,
  });

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    consentApi
      .getTypes()
      .then((typeItems) => {
        if (!cancelled) setTypes(typeItems);
      })
      .catch((error) => {
        if (!cancelled) toastRef.current.fromError(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { data: listData, loading, errorMessage, refetch } = useAsyncData(
    async () => {
      const { filterTypeId: typeId, filterStatus: status, page } = appliedParams;
      const params: Record<string, string | number> = { page, limit: 10 };
      if (typeId) params.typeId = typeId;
      if (status) params.status = status;
      return consentApi.getPolicies(params);
    },
  );

  const items = useMemo(() => listData?.data ?? [], [listData?.data]);
  const meta = listData?.meta ?? defaultMeta;

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedParams]);

  const handlePageChange = (newPage: number) => {
    setAppliedParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              รายการความยินยอม / นโยบาย
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              จัดการเอกสารนโยบาย ข้อกำหนด และข้อความยินยอมที่แสดงบนแอปพลิเคชัน
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/consents/create")}
            className="flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#24A148] text-white text-sm font-medium hover:bg-[#1e8e3e] transition-all hover:shadow-[0_4px_12px_rgba(36,161,72,0.25)]"
          >
            <Plus size={18} />
            เพิ่มรายการใหม่
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="flex h-[74px] items-center justify-center gap-8 rounded-[10px] border border-[#EAEAEA]"
            >
              <span
                className={`inline-flex h-[26px] min-w-[86px] items-center justify-center rounded-full px-4 text-xs font-medium ${card.pillClass}`}
              >
                {card.label}
              </span>
              <span className="flex items-center gap-3">
                <strong className="text-[28px] font-bold leading-none text-[#243333]">
                  -
                </strong>
                <span className="text-sm text-[#9CA3AF]">รายการ</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Select
            size="md"
            className="w-[260px]"
            label="ประเภท"
            placeholder="เลือกประเภท"
            value={filterTypeId}
            onChange={(value) => {
              setFilterTypeId(value);
              setAppliedParams((prev) => ({ ...prev, filterTypeId: value, page: 1 }));
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              ...types.map((item) => ({ label: item.name, value: item.id })),
            ]}
          />
          <Select
            size="md"
            className="w-[260px]"
            label="สถานะ"
            placeholder="เลือกสถานะ"
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setAppliedParams((prev) => ({ ...prev, filterStatus: value, page: 1 }));
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: "ร่าง", value: "DRAFT" },
              { label: "เผยแพร่", value: "PUBLISHED" },
              { label: "เก็บถาวร", value: "ARCHIVED" },
            ]}
          />
        </div>

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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  ลำดับ
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  ชื่อรายการ
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  รายละเอียด
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  เวอร์ชั่น
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  ประเภท
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  กำหนดข้อบังคับ
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  อัปเดตล่าสุด
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  สถานะ
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-[#F5F5F5] animate-pulse">
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="py-4 px-4">
                        <div className="h-4 w-20 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <ErrorState message={errorMessage} onRetry={() => refetch()} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-[#9CA3AF]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const status = statusConfig[item.status] ?? statusConfig.DRAFT;
                  const canEdit = item.status === "DRAFT";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {(meta.page - 1) * meta.limit + idx + 1}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{item.title}</td>
                      <td className="py-4 px-4 max-w-[260px] text-sm text-gray-600">
                        <span className="line-clamp-1">{item.description || "-"}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{item.version}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.type?.name || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className={item.isRequired ? "text-[#24A148]" : "text-[#F44034]"}>
                          {item.isRequired ? "บังคับ" : "ไม่บังคับ"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(item.updatedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <ActionIconButton
                            icon={Eye}
                            variant="primary"
                            onClick={() => setPreviewItem(item)}
                          />
                          {canEdit && (
                            <ActionIconButton
                              icon={Pencil}
                              variant="accent"
                              onClick={() => router.push(`/consents/edit/${item.id}`)}
                            />
                          )}
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
          onPageChange={handlePageChange}
        />
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button
            type="button"
            aria-label="ปิด"
            className="absolute inset-0 bg-black/30"
            onClick={() => setPreviewItem(null)}
          />
          <div className="relative w-full max-w-[720px] rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <h2 className="text-lg font-bold text-[#243333]">{previewItem.title}</h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              เวอร์ชั่น {previewItem.version} · {previewItem.type?.name || "-"}
            </p>
            <div className="mt-6 space-y-4 text-sm text-[#565656]">
              <div>
                <p className="font-bold text-[#243333]">คำอธิบาย</p>
                <p className="mt-1">{previewItem.description || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-[#243333]">รายละเอียดฉบับเต็ม</p>
                <div
                  className="mt-2 max-h-[320px] overflow-auto rounded-[10px] border border-[#EAEAEA] p-4"
                  dangerouslySetInnerHTML={{
                    __html: previewItem.contentHtml || "-",
                  }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="h-[40px] px-5 rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
