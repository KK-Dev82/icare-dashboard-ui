"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { dashboardApi } from "@/api/dashboard";
import { ActionIconButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import type { DashboardMember } from "@/types/dashboard";
import type { AccountLevel, PaginationMeta } from "@/types/member";
import {
  getMemberDateFilterParams,
  type MemberQuickFilter,
} from "../utils/memberDateFilter";

const MEMBER_PAGE_SIZE = 10;

const defaultMemberMeta: PaginationMeta = {
  page: 1,
  limit: MEMBER_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export function NewMembersReport({
  canViewMemberDetail,
}: {
  canViewMemberDetail: boolean;
}) {
  const router = useRouter();
  const [newMembers, setNewMembers] = useState<DashboardMember[]>([]);
  const [memberMeta, setMemberMeta] = useState<PaginationMeta>(defaultMemberMeta);
  const [memberLoading, setMemberLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberAccountLevel, setMemberAccountLevel] = useState("");
  const [memberQuickFilter, setMemberQuickFilter] = useState<MemberQuickFilter>("30");
  const [memberCustomFrom, setMemberCustomFrom] = useState("");
  const [memberCustomTo, setMemberCustomTo] = useState("");
  const [appliedMemberSearch, setAppliedMemberSearch] = useState("");
  const [appliedMemberAccountLevel, setAppliedMemberAccountLevel] = useState("");
  const [appliedMemberQuickFilter, setAppliedMemberQuickFilter] =
    useState<MemberQuickFilter>("30");
  const [appliedMemberCustomFrom, setAppliedMemberCustomFrom] = useState("");
  const [appliedMemberCustomTo, setAppliedMemberCustomTo] = useState("");
  const [memberPage, setMemberPage] = useState(1);

  const fetchMembers = useCallback(async () => {
    setMemberLoading(true);

    try {
      const dateParams = getMemberDateFilterParams(
        appliedMemberQuickFilter,
        appliedMemberCustomFrom,
        appliedMemberCustomTo
      );
      const res = await dashboardApi.getMembers({
        keyword: appliedMemberSearch || undefined,
        accountLevel:
          (appliedMemberAccountLevel as AccountLevel) || undefined,
        ...dateParams,
        page: memberPage,
        limit: MEMBER_PAGE_SIZE,
      });

      setNewMembers(res.data);
      setMemberMeta({
        ...res.meta,
        totalPages: Math.max(1, res.meta.totalPages),
      });
    } catch (err) {
      console.error("[dashboard] members failed", err);
      setNewMembers([]);
      setMemberMeta(defaultMemberMeta);
    } finally {
      setMemberLoading(false);
    }
  }, [
    appliedMemberAccountLevel,
    appliedMemberCustomFrom,
    appliedMemberCustomTo,
    appliedMemberQuickFilter,
    appliedMemberSearch,
    memberPage,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchMembers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchMembers]);

  return (
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
          placeholder="ค้นหาเบอร์โทรศัพท์, อีเมล, ชื่อ, นามสกุล"
          value={memberSearch}
          onChange={(event) => setMemberSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setAppliedMemberSearch(memberSearch.trim());
              setMemberPage(1);
            }
          }}
        />
        <Select
          size="md"
          className="w-full lg:flex-1"
          label="สถานะกรมธรรม์"
          placeholder="เลือกสถานะ"
          value={memberAccountLevel}
          onChange={(value) => {
            setMemberAccountLevel(value);
            setAppliedMemberAccountLevel(value);
            setMemberPage(1);
          }}
          options={[
            { label: "ทั้งหมด", value: "" },
            { label: "สมาชิก", value: "MEMBER" },
            { label: "ลูกค้า", value: "CUSTOMER" },
          ]}
        />
        <Select
          size="md"
          className="w-full lg:w-[190px]"
          label="ช่วงวันที่สมัคร"
          placeholder="เลือกช่วงวันที่"
          value={memberQuickFilter}
          onChange={(value) => {
            const qf = value as MemberQuickFilter;
            setMemberQuickFilter(qf);
            setAppliedMemberQuickFilter(qf);
            if (qf !== "CUSTOM") {
              setMemberCustomFrom("");
              setAppliedMemberCustomFrom("");
              setMemberCustomTo("");
              setAppliedMemberCustomTo("");
            }
            setMemberPage(1);
          }}
          options={[
            { label: "ทั้งหมด", value: "" },
            { label: "7 วันล่าสุด", value: "7" },
            { label: "30 วันล่าสุด", value: "30" },
            { label: "3 เดือนล่าสุด", value: "90" },
            { label: "กำหนดเอง", value: "CUSTOM" },
          ]}
        />
      </div>

      {memberQuickFilter === "CUSTOM" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-[520px] animate-[fade-up_0.3s_ease-out]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#565656]">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={memberCustomFrom}
              onChange={(event) => {
                setMemberCustomFrom(event.target.value);
                setAppliedMemberCustomFrom(event.target.value);
                setMemberPage(1);
              }}
              className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] px-4 text-sm text-[#565656] outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#565656]">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={memberCustomTo}
              onChange={(event) => {
                setMemberCustomTo(event.target.value);
                setAppliedMemberCustomTo(event.target.value);
                setMemberPage(1);
              }}
              className="h-[42px] w-full rounded-[10px] border border-[#DCDCDC] px-4 text-sm text-[#565656] outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <TableHead>ลำดับ</TableHead>
              <TableHead>ชื่อ - นามสกุล</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
              <TableHead>สถานะกรมธรรม์</TableHead>
              <TableHead>วันที่สมัคร</TableHead>
              <TableHead>จัดการ</TableHead>
            </tr>
          </thead>
          <tbody>
            {memberLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-[#F5F5F5]">
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : newMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#9CA3AF]">
                  ไม่พบข้อมูลสมาชิก
                </td>
              </tr>
            ) : (
              newMembers.map((member, index) => (
                <tr key={member.id} className="border-b border-[#F5F5F5]">
                  <TableCell>
                    {(memberMeta.page - 1) * memberMeta.limit + index + 1}
                  </TableCell>
                  <TableCell>
                    {[member.firstName, member.lastName].filter(Boolean).join(" ") ||
                      member.phone}
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <span
                      className={
                        member.accountLevel === "CUSTOMER"
                          ? "text-[#24A148]"
                          : "text-[#9FA2A9]"
                      }
                    >
                      {member.accountLevel === "CUSTOMER" ? "ลูกค้า" : "สมาชิก"}
                    </span>
                  </TableCell>
                  <TableCell>{formatThaiDate(member.createdAt)}</TableCell>
                  <TableCell>
                    {canViewMemberDetail ? (
                      <ActionIconButton
                        icon={Search}
                        variant="primary"
                        iconSize={16}
                        iconStrokeWidth={3}
                        className="mx-auto"
                        onClick={() => router.push(`/members/${member.id}`)}
                      />
                    ) : (
                      <span className="text-[#B7B7B7]">-</span>
                    )}
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        current={newMembers.length}
        total={memberMeta.total}
        page={memberMeta.page}
        totalPages={memberMeta.totalPages}
        onPageChange={setMemberPage}
      />
    </section>
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
      <h2 className="text-xl font-bold leading-8 text-[#243333]">{title}</h2>
      <p className="text-base leading-[25px] text-[#9FA2A9]">{description}</p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-center text-xs font-semibold text-[#707070]">
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-4 text-center text-sm text-[#707070] ${className}`}>
      {children}
    </td>
  );
}

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
