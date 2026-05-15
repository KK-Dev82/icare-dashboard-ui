"use client";

import { Eye, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionIconButton } from "@/components/ui/action-button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { memberApi } from "@/api/member";
import type { Member } from "@/types/member";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const router = useRouter();

  useEffect(() => {
    memberApi.getMembers().then(setMembers);
  }, []);

  return (
    <div>
      {/* Content Card */}
      <div className="flex w-full flex-col rounded-[18px] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Page Header */}
        <div className="mb-6 border-b border-[#EAEAEA] pb-5">
          <h1 className="text-lg font-bold text-[#243333]">รายการสมาชิก</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            จัดการข้อมูลสมาชิกและกรมธรรม์ได้ในที่เดียว
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Input
            size="md"
            className="w-[280px]"
            placeholder="ค้นหา"
            label="ค้นหา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            size="md"
            className="w-[230px]"
            placeholder="เลือกสถานะกรมธรรม์"
            label="สถานะกรมธรรม์"
            options={[
              { label: "มีกรมธรรม์", value: "has_policy" },
              { label: "ไม่มีกรมธรรม์", value: "no_policy" },
            ]}
          />
          <Select
            size="md"
            className="w-[230px]"
            label="สถานะการใช้งาน"
            placeholder="เลือกสถานะการใช้งาน"
            options={[
              { label: "เปิดการใช้งาน", value: "active" },
              { label: "ปิดการใช้งาน", value: "inactive" },
            ]}
          />
          <button className="h-[42px] rounded-[8px] bg-[#FF944D] px-8 text-[14px] font-medium text-white transition hover:bg-[#f28338]">
            ค้นหา
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAEAEA]">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ลำดับ</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">อีเมล</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะกรมธรรม์</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">สถานะการใช้งาน</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr
                  key={member.id}
                  className="border-b border-[#F5F5F5] hover:bg-primary/[0.02] transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-800">{member.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{member.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{member.phone}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${member.hasPolicy ? "text-primary" : "text-[#BDBDBD]"}`}>
                      {member.hasPolicy ? "มีกรมธรรม์" : "ไม่มีกรมธรรม์"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${member.isActive ? "text-primary" : "text-error"}`}>
                      {member.isActive ? "เปิดการใช้งาน" : "ปิดการใช้งาน"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        icon={Eye}
                        variant="primary"
                        onClick={() => router.push(`/members/${member.id}`)}
                      />
                      <ActionIconButton
                        icon={Power}
                        variant={member.isActive ? "danger" : "primary"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination current={members.length} total={members.length} />
      </div>
    </div>
  );
}
