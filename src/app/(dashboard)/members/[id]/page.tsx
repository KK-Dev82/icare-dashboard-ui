"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { memberApi } from "@/api/member";
import { ErrorState } from "@/components/ui/error-state";
import type { Member, MemberInsuranceItem } from "@/types/member";

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [insurance, setInsurance] = useState<MemberInsuranceItem[]>([]);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setErrorMessage(null);
    Promise.all([
      memberApi.getById(id),
      memberApi.getInsurance(id).catch(() => null),
    ]).then(([memberRes, insuranceRes]) => {
      if (memberRes.success) setMember(memberRes.data);
      if (insuranceRes?.success) {
        setInsurance(insuranceRes.data.data);
        setInsuranceTotal(insuranceRes.data.total);
      }
    }).catch((err) => {
      setErrorMessage(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return null;

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState message={errorMessage} onRetry={fetchData} />
      </div>
    );
  }

  if (!member) return null;

  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ") || "-";
  const activeCount = insurance.filter((i) => i.status === "A").length;
  const expiredCount = insurance.filter((i) => i.status !== "A").length;

  return (
    <div className="min-h-screen bg-[#F4FAFA] p-6">
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left Content */}
        <section className="rounded-[24px] bg-white p-6">
          <div className="border-b border-[#EAEAEA] pb-5">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-[#243333]">ข้อมูลสมาชิก</h1>
                <p className="text-sm text-[#9CA3AF]">ID: {member.id}</p>
              </div>
              <span
                className="rounded-full px-4 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: member.accountLevel === "CUSTOMER" ? "#07A2A2" : "#FF944D" }}
              >
                {member.accountLevel === "CUSTOMER" ? "ลูกค้า" : "สมาชิก"}
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
                <InfoWhite label="ชื่อ - นามสกุล:" value={fullName} />
                <InfoWhite label="อีเมล:" value={member.email || "-"} />
                <InfoWhite label="เบอร์โทรศัพท์:" value={member.phone} />
                <InfoWhite label="สถานะ:" value={member.status === "ACTIVE" ? "ใช้งานอยู่" : "ปิดใช้งาน"} />
                <InfoWhite label="ยืนยันเบอร์:" value={member.isPhoneVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"} />
                <InfoWhite label="วันสมัคร:" value={new Date(member.createdAt).toLocaleDateString("th-TH")} />
              </div>
            </div>

            <div className="rounded-[14px] border border-[#EAEAEA] bg-white p-5">
              <h3 className="font-bold text-[#243333]">ภาพรวมกรมธรรม์</h3>
              <div className="mt-4 space-y-2 text-xs">
                <SummaryRow label="กรมธรรม์ทั้งหมด" value={`${insuranceTotal} รายการ`} />
                <SummaryRow label="กำลังคุ้มครอง" value={`${activeCount} รายการ`} />
                <SummaryRow label="หมดอายุ" value={`${expiredCount} รายการ`} />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6 flex items-center gap-3">
            <Input size="md" className="w-[190px]" label="ค้นหา" placeholder="ค้นหา" />
            <Select
              size="md"
              className="w-[170px]"
              label="สถานะกรมธรรม์"
              placeholder="เลือกสถานะ"
              options={[
                { label: "คุ้มครอง", value: "A" },
                { label: "หมดอายุ", value: "E" },
              ]}
            />
            <Select
              size="md"
              className="w-[170px]"
              label="ประเภทประกัน"
              placeholder="เลือกประเภท"
              options={[
                { label: "MOBILE", value: "MOBILE" },
                { label: "MOTOR", value: "MOTOR" },
              ]}
            />
            <button className="h-[42px] flex-1 rounded-[10px] bg-[#FF944D] text-sm font-medium text-white hover:bg-[#f28338]">
              ค้นหา
            </button>
          </div>

          {/* Insurance Cards */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {insurance.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูลกรมธรรม์</div>
            ) : (
              insurance.map((item) => (
                <InsuranceCard key={item.id} item={item} />
              ))
            )}
          </div>
        </section>

        {/* Right Panel */}
        <aside className="rounded-[24px] bg-white p-6">
          <div className="border-b border-[#EAEAEA] pb-5">
            <h2 className="text-lg font-bold text-[#243333]">ข้อมูลการเคลม</h2>
          </div>

          <div className="mt-5 flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-[#9CA3AF]">ยังไม่มีข้อมูลการเคลม</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InsuranceCard({ item }: { item: MemberInsuranceItem }) {
  const isActive = item.status === "A";
  const policyNo = item.policies?.[0]?.no || item.certificateNo;

  return (
    <div className="relative rounded-[20px] border border-[#EAEAEA] bg-white p-6 transition hover:border-[#07A2A2] hover:shadow-sm">
      <div className="mb-7">
        <p className="text-xs text-[#9CA3AF]">เลขที่กรมธรรม์</p>
        <h3 className="mt-1 text-[15px] font-bold text-[#111827]">{policyNo}</h3>
      </div>

      <span
        className={`absolute right-5 top-5 rounded-full px-4 py-1.5 text-xs font-medium text-white ${isActive ? "bg-[#07A2A2]" : "bg-[#F44034]"}`}
      >
        {isActive ? "คุ้มครอง" : "หมดอายุ"}
      </span>

      <div className="space-y-5 text-sm">
        <InfoRow label="ผลิตภัณฑ์" value={item.product.name} />
        <InfoRow label="วันเริ่มคุ้มครอง" value={new Date(item.effectiveOn).toLocaleDateString("th-TH")} />
        <InfoRow label="วันสิ้นสุด" value={new Date(item.expireOn).toLocaleDateString("th-TH")} />
        <InfoRow label="ทุนประกัน" value={`${Number(item.sumInsured).toLocaleString()} บาท`} />
        {item.mobile && <InfoRow label="อุปกรณ์" value={`${item.mobile.brand} ${item.mobile.model}`} />}
        {item.vehicle && <InfoRow label="ทะเบียน" value={item.vehicle.plateNo} />}
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="text-right text-sm font-semibold text-[#565656]">{value}</p>
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
