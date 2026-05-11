"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, CheckCircle } from "lucide-react";
import { PolicyCard } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { memberApi } from "@/api/member";
import type { MemberDetail, ClaimItem } from "@/types/member";

function ClaimCard({ claim }: { claim: ClaimItem }) {
  return (
    <div className="rounded-[20px] border border-[#EAEAEA] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[#9CA3AF]">เลขที่เคลม</p>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            claim.status === "pending"
              ? "bg-[#FFF0E6] text-[#FF944D]"
              : "bg-[#DDF7F7] text-[#07A2A2]"
          }`}
        >
          {claim.status === "pending" ? "รอตรวจสอบ" : "สำเร็จ"}
        </span>
      </div>

      <h4 className="font-bold text-[#111827]">{claim.id}</h4>
      <p className="mt-2 text-xs text-[#8A8A8A]">ยื่นเมื่อ : {claim.submitDate}</p>
      <p className="mt-1 text-xs text-[#8A8A8A]">
        เลขกรมธรรม์ : {claim.policyNo}
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2 text-center text-[11px] text-[#07A2A2]">
        {["ยื่นคำร้อง", "กำลังตรวจสอบ", "อนุมัติ", "สำเร็จ"].map((item) => (
          <div key={item} className="space-y-1">
            <CheckCircle className="mx-auto h-4 w-4 fill-[#07A2A2] text-white" />
            <p>{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-[#CDF5F5]">
        <div className="h-full w-full rounded-full bg-[#07A2A2]" />
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<MemberDetail | null>(null);

  useEffect(() => {
    memberApi.getMemberById(params.id as string).then(setMember);
  }, [params.id]);

  if (!member) return null;

  return (
    <div className="min-h-screen bg-[#F4FAFA] p-6">
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left Content */}
        <section className="rounded-[24px] bg-white p-6">
          <div className="border-b border-[#EAEAEA] pb-5">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-[#243333]">
                  ข้อมูลสมาชิก
                </h1>
                <p className="text-sm text-[#9CA3AF]">
                  Member ID: {member.memberId}
                </p>
              </div>

              <span className="rounded-full bg-[#FF944D] px-4 py-1 text-xs font-medium text-white">
                {member.hasPolicy ? "มีกรมธรรม์" : "ไม่มีกรมธรรม์"}
              </span>
            </div>
          </div>

          {/* Member Summary */}
          <div className="mt-6 grid grid-cols-[110px_1fr_190px] gap-4">
            <div className="flex items-center justify-center self-stretch rounded-[14px] bg-[#EFEFEF]">
              <User className="h-12 w-12 text-white" />
            </div>

            <div className="relative overflow-hidden rounded-[20px] bg-[#07A2A2] p-6 text-white">
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10" />
              <div className="relative grid grid-cols-2 gap-y-4 text-sm">
                <InfoWhite label="ชื่อ - นามสกุล:" value={member.name} />
                <InfoWhite label="อีเมล:" value={member.email} />
                <InfoWhite label="Member ID:" value={member.memberId} />
                <InfoWhite label="วันสมัครสมาชิก:" value={member.registerDate} />
                <InfoWhite label="เบอร์โทรศัพท์:" value={member.phone} />
                <InfoWhite label="สถานะสมาชิก:" value={member.status} />
              </div>
            </div>

            <div className="rounded-[14px] border border-[#EAEAEA] bg-white p-5">
              <h3 className="font-bold text-[#243333]">ภาพรวมกรมธรรม์</h3>
              <div className="mt-4 space-y-2 text-xs">
                <SummaryRow label="กรมธรรม์ทั้งหมด" value={`${member.policySummary.total} รายการ`} />
                <SummaryRow label="กำลังคุ้มครอง" value={`${member.policySummary.active} รายการ`} />
                <SummaryRow label="ใกล้หมดอายุ" value={`${member.policySummary.nearExpire} รายการ`} />
                <SummaryRow label="หมดอายุ" value={`${member.policySummary.expired} รายการ`} />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6 flex items-center gap-3">
            <Input
              size="md"
              className="w-[190px]"
              label="ค้นหา"
              placeholder="ค้นหา"
            />

            <Select
              size="md"
              className="w-[170px]"
              label="สถานะกรมธรรม์"
              placeholder="เลือกสถานะ"
              options={[
                { label: "คุ้มครอง", value: "active" },
                { label: "หมดอายุ", value: "expired" },
                { label: "ใกล้หมดอายุ", value: "near_expire" },
              ]}
            />

            <Select
              size="md"
              className="w-[170px]"
              label="ประเภทประกัน"
              placeholder="เลือกประเภท"
              options={[
                { label: "ประกันรถยนต์", value: "car" },
                { label: "ประกันเดินทาง", value: "travel" },
                { label: "ประกันอุบัติเหตุ", value: "accident" },
              ]}
            />

            <Select
              size="md"
              className="w-[170px]"
              label="สถานะการใช้งาน"
              placeholder="เลือกสถานะ"
              options={[
                { label: "เปิดการใช้งาน", value: "active" },
                { label: "ปิดการใช้งาน", value: "inactive" },
              ]}
            />

            <button className="h-[42px] flex-1 rounded-[10px] bg-[#FF944D] text-sm font-medium text-white hover:bg-[#f28338]">
              ค้นหา
            </button>
          </div>

          {/* Policy Cards */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {member.policies.map((policy) => (
              <PolicyCard
                key={policy.no}
                policyNumber={policy.no}
                status={policy.status}
                type={policy.type}
                coverageDate={policy.period}
                sumInsured={policy.insured}
                licensePlate={policy.plate}
              />
            ))}
          </div>
        </section>

        {/* Right Claim Panel */}
        <aside className="rounded-[24px] bg-white p-6">
          <div className="border-b border-[#EAEAEA] pb-5">
            <h2 className="text-lg font-bold text-[#243333]">
              ข้อมูลการเคลม
            </h2>
          </div>

          <div className="mt-5 flex gap-3">
            <Select
              size="md"
              className="flex-1"
              placeholder="เลือกกรมธรรม์"
              options={member.policies.map((p) => ({ label: p.no, value: p.no }))}
            />
            <button className="h-[42px] rounded-[10px] bg-[#FF944D] px-5 text-xs font-medium text-white">
              ค้นหา
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {member.claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoWhite({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <p className="text-xs text-white/80">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#9CA3AF]">{label}</span>
      <span className="font-bold text-[#111827]">{value}</span>
    </div>
  );
}
