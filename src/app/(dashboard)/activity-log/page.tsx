"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, XCircle } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-button";
import { ErrorState } from "@/components/ui/error-state";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { activityLogApi } from "@/api/activity-log";
import { userApi } from "@/api/user";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  ACTIVITY_ACTION_OPTIONS,
  ACTIVITY_ENTITY_TYPE_OPTIONS,
  formatActivityActionLabel,
  formatActivityEntityTypeLabel,
  formatActivityFieldLabel,
  formatActivityValueLabel,
} from "@/lib/activityLogLabels";
import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLog,
  ActivityLogFilter,
} from "@/types/activity-log";
import type { AdminUser } from "@/types/user";

const defaultMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const entityTypeOptions = ACTIVITY_ENTITY_TYPE_OPTIONS;
const actionOptions = ACTIVITY_ACTION_OPTIONS;

const DETAIL_FIELD_ORDER: Record<string, string[]> = {
  CONTENT: [
    "title",
    "categoryId",
    "summary",
    "content",
    "mainImage",
    "bannerImage",
    "album",
    "sortOrder",
    "isPinned",
    "isPublish",
    "status",
    "publishedAt",
    "expiredAt",
  ],
  PRODUCT: [
    "title",
    "categoryId",
    "summary",
    "content",
    "mainImage",
    "bannerImage",
    "album",
    "coverages",
    "isPinned",
    "isPublish",
    "status",
    "publishedAt",
    "expiredAt",
  ],
  CONTENT_CATEGORY: [
    "name",
    "description",
    "bannerImage",
    "icon",
    "tagColor",
    "isActive",
    "sortOrder",
  ],
  PRODUCT_CATEGORY: [
    "name",
    "description",
    "bannerImage",
    "icon",
    "tagColor",
    "isActive",
    "sortOrder",
  ],
  CONTACT_CATEGORY: ["name", "isActive", "sortOrder"],
  CONTACT_CASE: [
    "caseNo",
    "contactName",
    "contactPhone",
    "contactEmail",
    "categoryId",
    "subject",
    "message",
    "readStatus",
    "caseStatus",
    "submittedAt",
    "readAt",
    "contactedAt",
    "closedAt",
  ],
  LEAD: [
    "fullName",
    "phone",
    "email",
    "note",
    "status",
    "contactedAt",
    "closedAt",
  ],
  ADMIN_USER: ["username", "role", "fullName", "email", "status"],
  USER: ["username", "role", "fullName", "firstName", "lastName", "email", "phone", "status"],
  AUTH: ["username"],
  SETTING: ["key", "value", "description"],
};

const initialFilter: ActivityLogFilter = {
  page: 1,
  limit: 10,
};

export default function ActivityLogPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminId, setAdminId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<ActivityLogFilter>(initialFilter);
  const canViewActivityLog = currentRole === "SUPER_ADMIN";

  const { data: listData, loading, errorMessage, refetch } = useAsyncData(async () => {
    const res = await activityLogApi.getAll(appliedFilter);
    if (res.success === false) throw new Error("โหลดประวัติการใช้งานไม่สำเร็จ");
    return { items: res.data, meta: res.meta ?? defaultMeta };
  });

  const items = listData?.items ?? [];
  const meta = listData?.meta ?? defaultMeta;
  const adminUserOptions = useMemo(
    () => [
      { label: "ทั้งหมด", value: "" },
      ...adminUsers
        .slice()
        .sort((a, b) => getAdminUserLabel(a).localeCompare(getAdminUserLabel(b), "th"))
        .map((user) => ({
          label: getAdminUserLabel(user),
          value: user.id,
        })),
    ],
    [adminUsers],
  );
  const adminUserNameMap = useMemo(
    () =>
      adminUsers.reduce<Record<string, string>>((map, user) => {
        map[user.id] = getAdminUserLabel(user);
        return map;
      }, {}),
    [adminUsers],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setCurrentRole(localStorage.getItem("role"));
      setRoleChecked(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (canViewActivityLog) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilter, canViewActivityLog]);

  useEffect(() => {
    if (!canViewActivityLog) return;

    let active = true;
    userApi
      .getAll()
      .then((res) => {
        if (active && res.success) setAdminUsers(res.data);
      })
      .catch((error) => console.error("[activity-log] admin users failed", error));

    return () => {
      active = false;
    };
  }, [canViewActivityLog]);

  const handleSearch = () => {
    setAppliedFilter({
      adminId: adminId.trim() || undefined,
      entityType: (entityType || undefined) as ActivityEntityType | undefined,
      action: (action || undefined) as ActivityAction | undefined,
      page: 1,
      limit: 10,
    });
  };

  const handleClear = () => {
    setAdminId("");
    setEntityType("");
    setAction("");
    setAppliedFilter(initialFilter);
  };

  const handlePageChange = (page: number) => {
    setAppliedFilter((prev) => ({ ...prev, page }));
  };

  if (roleChecked && !canViewActivityLog) {
    return (
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <ErrorState message="ไม่มีสิทธิ์เข้าถึงหน้านี้" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-center justify-between border-b border-[#EAEAEA] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ประวัติการใช้งาน</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              แสดงบันทึกกิจกรรมการใช้งานของผู้ใช้งานในระบบ
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Select
            size="md"
            className="w-[230px]"
            label="ผู้ใช้งาน"
            placeholder="ผู้ใช้งานทั้งหมด"
            value={adminId}
            onChange={setAdminId}
            options={adminUserOptions}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="เมนู"
            placeholder="เมนูทั้งหมด"
            value={entityType}
            onChange={setEntityType}
            options={entityTypeOptions}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="การกระทำ"
            placeholder="การกระทำทั้งหมด"
            value={action}
            onChange={setAction}
            options={actionOptions}
          />
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
            className="h-[42px] rounded-[8px] border border-[#DCDCDC] px-8 text-[14px] font-medium text-[#565656] transition hover:bg-gray-50"
          >
            ล้าง
          </button>
        </div>

        {!loading && errorMessage && items.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-[8px] border border-[#FF944D]/30 bg-[#FF944D]/5 px-4 py-3 text-sm text-[#FF944D]">
            <span>ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลเดิม</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-4 shrink-0 rounded-[6px] border border-[#FF944D]/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-[#FF944D]/10"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ลำดับ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">วันที่และเวลา</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">ผู้ใช้งาน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">การกระทำ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">เมนู</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                    <td className="px-4 py-4"><div className="mx-auto h-4 w-6 rounded bg-gray-100" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-4 w-32 rounded bg-gray-100" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-4 w-24 rounded bg-gray-100" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-4 w-20 rounded bg-gray-100" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-4 w-24 rounded bg-gray-100" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-8 w-8 rounded-lg bg-gray-100" /></td>
                  </tr>
                ))
              ) : errorMessage && items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <ErrorState message={errorMessage} onRetry={() => refetch()} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-[#9CA3AF]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#F5F5F5] transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {getAdminName(item, adminUserNameMap)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {getActionLabel(item.action)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {getEntityLabel(item.entityType)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <ActionIconButton
                          icon={Search}
                          variant="primary"
                          onClick={() => setSelectedLog(item)}
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
        onPageChange={handlePageChange}
      />
      </div>

      <ActivityLogDetailModal
        log={selectedLog}
        adminUserNameMap={adminUserNameMap}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

function ActivityLogDetailModal({
  log,
  adminUserNameMap,
  onClose,
}: {
  log: ActivityLog | null;
  adminUserNameMap: Record<string, string>;
  onClose: () => void;
}) {
  if (!log) return null;

  const changedFields = getChangedFields(log);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-6">
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="ปิด" />
      <div className="relative max-h-[calc(100vh-48px)] w-[542px] max-w-full overflow-y-auto rounded-[24px] bg-white px-7 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-[#FF944D]"
          aria-label="ปิด"
        >
          <XCircle size={18} fill="#FF944D" className="text-white" />
        </button>

        <div>
          <h2 className="text-[18px] font-bold leading-6 text-[#243333]">รายละเอียดการกระทำ</h2>
          <p className="mt-1 text-[14px] leading-5 text-[#9FA2A9]">{formatDateTime(log.createdAt)}</p>
        </div>

        <div className="mt-5 space-y-4">
          <ModalInfo label="ผู้ใช้งาน" value={getAdminName(log, adminUserNameMap)} />
          <ModalInfo label="การกระทำ" value={getActionLabel(log.action)} />
          <ModalInfo label="เมนู" value={getEntityLabel(log.entityType)} />
          {changedFields.length > 0 ? (
            <ModalChangedFields log={log} fields={changedFields} />
          ) : (
            <ModalInfo label="รายละเอียด" value={getModalDetailFallback(log)} />
          )}
        </div>
      </div>
    </div>
  );
}

function ModalInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold leading-5 text-[#243333]">{label}</p>
      <p className="text-[13px] leading-5 text-[#9FA2A9]">{value}</p>
    </div>
  );
}

function ModalChangedFields({
  log,
  fields,
}: {
  log: ActivityLog;
  fields: Array<{ field: string; before: unknown; after: unknown }>;
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold leading-5 text-[#243333]">รายละเอียด</p>
      <div className="mt-2 space-y-3">
        {fields.map((item) => (
          <ChangedFieldValue
            key={item.field}
            entityType={log.entityType}
            field={item.field}
            value={item.after}
          />
        ))}
      </div>
    </div>
  );
}

function ChangedFieldValue({
  entityType,
  field,
  value,
}: {
  entityType: string;
  field: string;
  value: unknown;
}) {
  const label = getFieldLabel(entityType, field);

  if (isImageField(field) && typeof value === "string" && value) {
    return (
      <div>
        <p className="text-[13px] leading-5 text-[#9FA2A9]">{label}:</p>
        <div className="mt-2 h-[74px] w-[96px] overflow-hidden rounded-[8px] border border-[#EAEAEA] bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (field === "album" && Array.isArray(value) && value.length > 0) {
    return (
      <div>
        <p className="text-[13px] leading-5 text-[#9FA2A9]">{label}:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {value.slice(0, 4).map((item, index) =>
            typeof item === "string" ? (
              <div
                key={`${item}-${index}`}
                className="h-[56px] w-[56px] overflow-hidden rounded-[8px] border border-[#EAEAEA] bg-gray-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item} alt={`${label} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="text-[13px] leading-5 text-[#9FA2A9]">
      {label}: {formatFieldValue(field, value)}
    </p>
  );
}

function getChangedFields(log: ActivityLog) {
  const before = log.previousData ?? {};
  const after = log.changedData ?? {};

  return Object.keys(after)
    .filter((key) => !isHiddenDetailField(key))
    .map((key, index) => ({
      field: key,
      before: before[key],
      after: after[key],
      index,
    }))
    .sort((a, b) => getFieldOrder(log.entityType, a.field, a.index) - getFieldOrder(log.entityType, b.field, b.index));
}

function getFieldOrder(entityType: string, field: string, fallbackIndex: number) {
  const order = DETAIL_FIELD_ORDER[entityType] ?? [];
  const index = order.indexOf(field);
  return index >= 0 ? index : order.length + fallbackIndex;
}

function getAdminUserLabel(user: AdminUser) {
  return user.username || user.id;
}

function getAdminName(log: ActivityLog, adminUserNameMap: Record<string, string> = {}) {
  const value =
    (log.adminId ? adminUserNameMap[log.adminId] : undefined) ||
    log.adminName ||
    log.adminId ||
    log.actorName ||
    log.createdByName ||
    log.admin?.fullName ||
    log.admin?.name ||
    log.admin?.username ||
    log.actor?.fullName ||
    log.actor?.name ||
    log.actor?.username ||
    log.createdBy ||
    "-";

  return formatActivityValueLabel(value);
}

function getActionLabel(action: string) {
  return formatActivityActionLabel(action);
}

function getEntityLabel(entityType: string) {
  return formatActivityEntityTypeLabel(entityType);
}

function getFieldLabel(entityType: string, field: string) {
  const labelByType: Partial<Record<ActivityEntityType, Record<string, string>>> = {
    PRODUCT: {
      name: "ชื่อผลิตภัณฑ์",
      title: "ชื่อผลิตภัณฑ์",
      code: "รหัสผลิตภัณฑ์",
      isPublish: "สถานะเผยแพร่",
      status: "สถานะ",
      description: "รายละเอียด",
      content: "รายละเอียด",
      mainImage: "รูปภาพหลัก",
      bannerImage: "รูปภาพแบนเนอร์",
      album: "อัลบั้ม",
    },
    CONTENT: {
      title: "หัวข้อ",
      summary: "สรุป",
      content: "รายละเอียด",
      mainImage: "รูปภาพหลัก",
      bannerImage: "รูปภาพแบนเนอร์",
      album: "อัลบั้ม",
      isPublish: "สถานะเผยแพร่",
      status: "สถานะ",
      publishedAt: "วันที่เผยแพร่",
    },
    USER: {
      username: "Username",
      fullName: "ชื่อผู้ใช้งาน",
      email: "อีเมล",
      role: "บทบาท",
      status: "สถานะ",
    },
  };

  return labelByType[entityType as ActivityEntityType]?.[field] ?? formatActivityFieldLabel(field);
}

function getLogDetail(log: ActivityLog) {
  if (log.description) return log.description;
  if (log.message) return log.message;
  if (log.fieldName) return `${getActionLabel(log.action)} ${log.fieldName}`;

  const entityLabel = getEntityLabel(log.entityType);
  const suffix = log.entityId ? ` เลขที่ ${log.entityId}` : "";
  return `${getActionLabel(log.action)}${entityLabel ? entityLabel : ""}${suffix}`;
}

function getModalDetailFallback(log: ActivityLog) {
  const hasChangePayload =
    Object.keys(log.previousData ?? {}).length > 0 || Object.keys(log.changedData ?? {}).length > 0;

  if (hasChangePayload) return "ไม่มีรายละเอียดการเปลี่ยนแปลง";

  return getLogDetail(log);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่ใช่";
  if (typeof value === "string" || typeof value === "number") {
    return typeof value === "string" ? formatActivityValueLabel(value) : String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    return value.map((item) => formatValue(item)).join(", ");
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatFieldValue(field: string, value: unknown): string {
  if (field === "isPublish" && typeof value === "boolean") {
    return value ? "เผยแพร่" : "ไม่เผยแพร่";
  }

  if (field === "isActive" && typeof value === "boolean") {
    return value ? "ใช้งาน" : "ไม่ใช้งาน";
  }

  if (field === "isPinned" && typeof value === "boolean") {
    return value ? "ปักหมุด" : "ไม่ปักหมุด";
  }

  if (field === "content" && typeof value === "string") {
    return stripHtml(value);
  }

  if (isDateField(field) && typeof value === "string") {
    return formatDateValue(value);
  }

  if (isImageField(field)) {
    return value ? "มีรูปภาพ" : "ไม่มีรูปภาพ";
  }

  if (field === "album" && Array.isArray(value)) {
    return value.length > 0 ? `${value.length} รูป` : "ไม่มีรูปภาพ";
  }

  return formatValue(value);
}

function formatDateValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function isImageField(field: string) {
  const normalized = field.toLowerCase();
  return (
    normalized === "icon" ||
    normalized === "image" ||
    normalized === "thumbnail" ||
    normalized.endsWith("image") ||
    normalized.includes("imageurl")
  );
}

function isDateField(field: string) {
  const normalized = field.toLowerCase();
  return normalized.endsWith("at") || normalized.endsWith("date");
}

function isHiddenDetailField(field: string) {
  const normalized = field.toLowerCase();
  return normalized === "id" || normalized.endsWith("id");
}
