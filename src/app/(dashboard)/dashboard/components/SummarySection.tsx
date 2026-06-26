"use client";

import { useEffect, useState } from "react";
import {
  Box,
  FileText,
  HeartHandshake,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { dashboardApi } from "@/api/dashboard";
import { Select } from "@/components/ui/select";
import type { DashboardSummary } from "@/types/dashboard";

type QuickRange = "" | "7" | "30" | "90" | "CUSTOM";

function getDateRange(range: QuickRange, customFrom: string, customTo: string) {
  if (range === "CUSTOM") {
    return { startDate: customFrom || undefined, endDate: customTo || undefined };
  }
  if (!range) return {};
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Number(range));
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export function SummarySection() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [quickRange, setQuickRange] = useState<QuickRange>("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fetchData = async (
    range?: QuickRange,
    from = customFrom,
    to = customTo
  ) => {
    const r = range !== undefined ? range : quickRange;
    const params = getDateRange(r, from, to);
    try {
      const res = await dashboardApi.getSummary(params);
      if (res.success) setSummary(res.data);
    } catch {}
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dashboardApi.getSummary().then((res) => {
        if (res.success) setSummary(res.data);
      }).catch(() => {});
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const summaryItems: Array<{
    value: string;
    unit: string;
    label: string;
    color: string;
    icon: LucideIcon;
  }> = [
    {
      value: summary ? String(summary.newMembers) : "-",
      unit: "คน",
      label: "สมาชิกใหม่",
      color: "#07A2A2",
      icon: UserRoundCheck,
    },
    {
      value: summary ? String(summary.newCases) : "-",
      unit: "รายการ",
      label: "คำร้องใหม่",
      color: "#2D7CA4",
      icon: HeartHandshake,
    },
    {
      value: summary ? String(summary.activeProducts) : "-",
      unit: "รายการ",
      label: "ผลิตภัณฑ์ที่เผยแพร่",
      color: "#FF944D",
      icon: Box,
    },
    {
      value: summary ? String(summary.activeContents) : "-",
      unit: "รายการ",
      label: "เนื้อหาที่เผยแพร่",
      color: "#FF7468",
      icon: FileText,
    },
  ];

  return (
    <section className="rounded-[18px] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 lg:py-9">
      <div className="flex flex-col gap-4 pb-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#243333]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            จัดการข้อมูลสมาชิกและกรมธรรม์ได้ในที่เดียว
          </p>
        </div>
        <div className="flex items-center gap-3 transition-all duration-300">
          <Select
            size="md"
            className="w-[190px]"
            label="ช่วงเวลา"
            placeholder="เลือกช่วงเวลา"
            value={quickRange}
            onChange={(v) => {
              const r = v as QuickRange;
              setQuickRange(r);
              if (r !== "CUSTOM") fetchData(r);
            }}
            options={[
              { label: "ทั้งหมด", value: "" },
              { label: "7 วันล่าสุด", value: "7" },
              { label: "30 วันล่าสุด", value: "30" },
              { label: "3 เดือนล่าสุด", value: "90" },
              { label: "กำหนดเอง", value: "CUSTOM" },
            ]}
          />
          {quickRange === "CUSTOM" ? (
            <div className="flex items-center gap-3 animate-[fade-up_0.3s_ease-out]">
              <div className="relative">
                <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-dark">วันเริ่มต้น</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    fetchData("CUSTOM", e.target.value, customTo);
                  }}
                  className="h-[42px] w-[160px] rounded-[10px] border border-[#DCDCDC] bg-white px-4 text-[14px] text-[#565656] outline-none focus:border-primary"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[12px] font-bold text-dark">วันสิ้นสุด</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    fetchData("CUSTOM", customFrom, e.target.value);
                  }}
                  className="h-[42px] w-[160px] rounded-[10px] border border-[#DCDCDC] bg-white px-4 text-[14px] text-[#565656] outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-7 border-t border-[#EAEAEA] pt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
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
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (value === "-") {
      const timer = window.setTimeout(() => setDisplayValue("-"), 0);
      return () => window.clearTimeout(timer);
    }
    const target = Number(value);
    if (isNaN(target)) {
      const timer = window.setTimeout(() => setDisplayValue(value), 0);
      return () => window.clearTimeout(timer);
    }

    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(String(target));
        clearInterval(timer);
      } else {
        setDisplayValue(String(Math.floor(current)));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="relative rounded-[18px] border border-[#EAEAEA] bg-white px-6 py-6">
      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#EAEAEA] text-[#111827]">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="pr-12">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold leading-none text-[#243333] tabular-nums">{displayValue}</p>
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
