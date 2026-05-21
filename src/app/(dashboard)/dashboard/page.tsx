"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CalendarDays,
  FileText,
  HeartHandshake,
  Search,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { memberApi } from "@/api/member";
import { policyApi } from "@/api/policy";
import { productApi } from "@/api/product";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import type { Member } from "@/types/member";

type SummaryKey = "users" | "policies" | "products" | "visitors";

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
    id: "visitors",
    value: "820",
    unit: "คนดู",
    label: "จำนวนผู้เข้าชม",
    color: "#2D7CA4",
    icon: HeartHandshake,
  },
];


export default function DashboardPage() {
  const [policyTotal, setPolicyTotal] = useState<number | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);
  const [newMembers, setNewMembers] = useState<Member[]>([]);

  useEffect(() => {
    productApi.getAll({ page: 1, limit: 1 }).then((res) => {
      if (res.success && res.meta) setProductTotal(res.meta.total);
    });

    policyApi.getAll({ page: 1, limit: 1 }).then((res) => {
      if (res.success && res.meta) setPolicyTotal(res.meta.total);
    });

    memberApi.getAll({ limit: 5 }).then((r) => r.data).then(setNewMembers);
  }, []);

  const summaryItems = useMemo(
    () =>
      defaultSummaryItems.map((item) => {
        if (item.id === "policies") {
          return { ...item, value: policyTotal === null ? "-" : String(policyTotal) };
        }

        if (item.id === "products") {
          return {
            ...item,
            value: productTotal === null ? "-" : String(productTotal),
          };
        }

        return item;
      }),
    [policyTotal, productTotal]
  );

  return (
    <div className="w-full space-y-6">
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

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <section className="flex flex-col rounded-[18px] bg-white px-6 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 xl:col-span-3">
          <PanelHeader
            title="รายการสมาชิกใหม่"
            description="ข้อมูลสมาชิกและกรมธรรม์ได้ในที่เดียว"
          />

          <div className="mt-5 flex flex-col gap-3 border-t border-[#EAEAEA] pt-6 lg:flex-row lg:items-center">
            <Input
              size="md"
              className="w-full lg:flex-1"
              label="ค้นหา"
              placeholder="ค้นหา"
            />
            <Select
              size="md"
              className="w-full lg:flex-1"
              label="สถานะกรมธรรม์"
              placeholder="เลือกสถานะ"
              options={[
                { label: "มีกรมธรรม์", value: "has_policy" },
                { label: "ไม่มีกรมธรรม์", value: "no_policy" },
              ]}
            />
            <button className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]">
              ค้นหา
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>ชื่อ - นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทรศัพท์</TableHead>
                  <TableHead>สถานะกรมธรรม์</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>จัดการ</TableHead>
                </tr>
              </thead>
              <tbody>
                {newMembers.map((member, index) => (
                  <tr key={member.id} className="border-b border-[#F5F5F5]">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{[member.firstName, member.lastName].filter(Boolean).join(" ") || member.phone}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <span className={member.accountLevel === "CUSTOMER" ? "text-[#24A148]" : "text-[#9FA2A9]"}>
                        {member.accountLevel === "CUSTOMER" ? "ลูกค้า" : "สมาชิก"}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(member.createdAt).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell>
                      <ActionIconButton
                        icon={Search}
                        variant="primary"
                        iconSize={16}
                        iconStrokeWidth={3}
                      />
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination current={newMembers.length} total={newMembers.length} />
        </section>

        <section className="flex flex-col rounded-[18px] bg-white px-6 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 xl:col-span-2">
          <PanelHeader title="คำร้องขอเคลม" description="รวมทุกคำร้องขอเคลม" />

          <div className="mt-5 flex flex-1 items-center justify-center border-t border-[#EAEAEA] pt-6">
            <p className="text-sm text-[#9CA3AF]">ยังไม่มีคำร้องขอเคลมในระบบ</p>
          </div>
        </section>
      </div>
    </div>
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

function PanelHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#243333]">{title}</h2>
      <p className="mt-1 text-sm text-[#9CA3AF]">{description}</p>
    </div>
  );
}

function TableHead({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-[#707070] ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-4 text-sm text-[#707070] ${
        align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}
