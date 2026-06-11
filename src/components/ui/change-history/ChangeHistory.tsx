"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { activityLogApi } from "@/api/activity-log";
import {
  formatActivityActionLabel,
  formatActivityEntityTypeLabel,
} from "@/lib/activityLogLabels";
import type {
  ActivityLog,
  ActivityLogEntityType,
} from "@/types/activity-log";

interface ChangeHistoryProps {
  entityType: ActivityLogEntityType;
  entityId: string;
}

export function ChangeHistory({ entityType, entityId }: ChangeHistoryProps) {
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");

      activityLogApi
        .getAll({ entityType, entityId, page: 1, limit: 10 })
        .then((res) => {
          if (active) setItems(res.data);
        })
        .catch((err) => {
          console.error("[change-history] fetch failed", err);
          if (active) {
            setItems([]);
            setError("ไม่สามารถโหลดประวัติการแก้ไขได้");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [entityId, entityType]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[10px] bg-[#F7F8FA] p-3">
              <div className="h-3 w-28 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-[14px] leading-5 text-[#F44034]">{error}</p>;
    }

    if (items.length === 0) {
      return <p className="text-[14px] leading-5 text-[#9CA3AF]">ยังไม่มีประวัติการแก้ไข</p>;
    }

    return (
      <div className="max-h-[368px] overflow-y-auto space-y-3 pr-1">
        {items.map((item) => (
          <div key={item.id} className="rounded-[10px] border border-[#EAEAEA] p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-[14px] font-semibold leading-5 text-[#243333]">
                {getActorName(item)}
              </p>
              <p className="shrink-0 text-[12px] leading-5 text-[#9CA3AF]">
                {formatHistoryDate(item.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-[14px] leading-5 text-[#707070]">
              {getLogMessage(item)}
            </p>
          </div>
        ))}
      </div>
    );
  }, [error, items, loading]);

  return (
    <div className="rounded-3xl border border-[#EAEAEA] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 size={17} className="text-[#243333]" />
        <h3 className="text-sm font-bold text-[#243333]">ประวัติการแก้ไข</h3>
      </div>
      {content}
    </div>
  );
}

function getActorName(item: ActivityLog) {
  return (
    item.actorName ||
    item.createdByName ||
    item.actor?.fullName ||
    item.actor?.name ||
    item.actor?.username ||
    item.admin?.fullName ||
    item.admin?.name ||
    item.admin?.username ||
    item.adminName ||
    item.adminId ||
    item.user?.fullName ||
    item.user?.name ||
    item.user?.username ||
    item.createdBy ||
    "ผู้ดูแลระบบ"
  );
}

function getLogMessage(item: ActivityLog) {
  if (item.description) return item.description;
  if (item.message) return item.message;
  if (item.fieldName) return `${formatActivityActionLabel(item.action)} ${item.fieldName}`;
  if (item.action) {
    return `${formatActivityActionLabel(item.action)} ${formatActivityEntityTypeLabel(item.entityType)}`;
  }
  if (item.event) return formatActivityActionLabel(item.event);
  return "มีการเปลี่ยนแปลงข้อมูล";
}

function formatHistoryDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
