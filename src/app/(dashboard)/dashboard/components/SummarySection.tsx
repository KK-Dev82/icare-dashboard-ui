"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CalendarDays,
  FileText,
  HeartHandshake,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { policyApi } from "@/api/policy";
import { productApi } from "@/api/product";

type SummaryKey = "users" | "policies" | "products" | "contact-case";

const defaultSummaryItems: Array<{
  id: SummaryKey;
  value: string;
  unit: string;
  label: string;
  color: string;
  icon: LucideIcon;
}> = [
  {
    id: "users",
    value: "82",
    unit: "คน",
    label: "จำนวนผู้ใช้งาน",
    color: "#07A2A2",
    icon: UserRoundCheck,
  },
  {
    id: "policies",
    value: "120",
    unit: "รายการ",
    label: "จำนวนกรมธรรม์",
    color: "#FF944D",
    icon: FileText,
  },
  {
    id: "products",
    value: "40",
    unit: "รายการ",
    label: "จำนวนผลิตภัณฑ์",
    color: "#FF7468",
    icon: Box,
  },
  {
    id: "contact-case",
    value: "820",
    unit: "รายการ",
    label: "จำนวนคำร้อง",
    color: "#2D7CA4",
    icon: HeartHandshake,
  },
];

export function SummarySection() {
  const [policyTotal, setPolicyTotal] = useState<number | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      policyApi.getAll({ page: 1, limit: 1 }).then((res) => {
        if (res.success && res.meta) setPolicyTotal(res.meta.total);
      }).catch(() => {});

      productApi.getAll({ page: 1, limit: 1 }).then((res) => {
        if (res.success && res.meta) setProductTotal(res.meta.total);
      }).catch(() => {});
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const summaryItems = useMemo(
    () =>
      defaultSummaryItems.map((item) => {
        if (item.id === "policies") {
          return { ...item, value: policyTotal === null ? "-" : String(policyTotal) };
        }

        if (item.id === "products") {
          return { ...item, value: productTotal === null ? "-" : String(productTotal) };
        }

        return item;
      }),
    [policyTotal, productTotal]
  );

  return (
    <section className="rounded-[18px] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 lg:py-9">
      <div className="flex flex-col gap-4 border-b border-[#EAEAEA] pb-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#243333]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            จัดการข้อมูลสมาชิกและกรมธรรม์ได้ในที่เดียว
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:min-w-[230px] sm:flex-1">
            <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-dark">
              กำหนดวันที่
            </label>
            <input
              type="text"
              value="11 - 05 - 2026"
              readOnly
              className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] bg-white px-4 pr-11 text-[14px] text-[#9CA3AF] outline-none"
            />
            <CalendarDays
              size={17}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#243333]"
            />
          </div>
          <button className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]">
            ค้นหา
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}

function SummaryCard({
  value,
  unit,
  label,
  color,
  icon: Icon,
}: {
  value: string;
  unit: string;
  label: string;
  color: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative rounded-[18px] border border-[#EAEAEA] bg-white px-6 py-6">
      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#EAEAEA] text-[#111827]">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="pr-12">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold leading-none text-[#243333]">{value}</p>
          <p className="text-xs text-[#9CA3AF]">{unit}</p>
        </div>
        <span
          className="mt-4 inline-flex rounded-full px-5 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
