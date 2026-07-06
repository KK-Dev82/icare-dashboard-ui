"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { memberApi } from "@/api/member";
import { claimApi } from "@/api/claim";
import { ErrorState } from "@/components/ui/error-state";
import type { Member, MemberInsuranceItem } from "@/types/member";
import type { Claim, ClaimStatus } from "@/types/claim";

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [insurance, setInsurance] = useState<MemberInsuranceItem[]>([]);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimPage, setClaimPage] = useState(1);
  const [claimTotalPages, setClaimTotalPages] = useState(1);
  const [insuranceSearch, setInsuranceSearch] = useState("");
  const [appliedInsuranceSearch, setAppliedInsuranceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setErrorMessage(null);
    Promise.all([
      memberApi.getById(id),
      memberApi.getInsurance(id).catch(() => null),
    ]).then(async ([memberRes, insuranceRes]) => {
      if (memberRes.success) {
        setMember(memberRes.data);
        if (memberRes.data.phone) {
          const phone = memberRes.data.phone.startsWith("66")
            ? "0" + memberRes.data.phone.slice(2)
            : memberRes.data.phone;
          setMemberPhone(phone);
          const claimRes = await claimApi.getByPhone(phone, { page: 1, limit: 5 }).catch(() => null);
          if (claimRes?.success) {
            setClaims(claimRes.data);
            setClaimTotalPages(claimRes.meta?.totalPages || 1);
          }
        }
      }
      if (insuranceRes?.success) {
        setInsurance(insuranceRes.data.data || insuranceRes.data || []);
        setInsuranceTotal((insuranceRes.data.data || insuranceRes.data || []).length);
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

  const handleClaimPageChange = async (page: number) => {
    setClaimPage(page);
    setClaims([]);
    const res = await claimApi.getByPhone(memberPhone, { page, limit: 5 }).catch(() => null);
    if (res?.success) {
      setClaims(res.data);
      setClaimTotalPages(res.meta?.totalPages || 1);
    }
  };

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
  const activeCount = (insurance || []).filter((i) => i.status === "ACTIVE").length;
  const expiredCount = (insurance || []).filter((i) => i.status !== "ACTIVE").length;

  const typeOptions = [
    { label: "ทั้งหมด", value: "" },
    ...[...new Set(insurance.map((i) => i.type))].map((t) => ({ label: t, value: t })),
  ];

  const filteredInsurance = insurance.filter((item) => {
    const policyNo = item.policies?.[0]?.no || item.certificateNo;
    if (appliedInsuranceSearch) {
      const kw = appliedInsuranceSearch.toLowerCase();
      const matchNo = policyNo?.toLowerCase().includes(kw);
      const matchName = item.product.name.toLowerCase().includes(kw);
      if (!matchNo && !matchName) return false;
    }
    if (statusFilter && item.status !== statusFilter) return false;
    if (typeFilter && item.product.type !== typeFilter) return false;
    return true;
  });

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
            <Input
              size="md"
              className="w-[190px]"
              label="ค้นหา"
              placeholder="ค้นหาเลขที่กรมธรรม์, ชื่อผลิตภัณฑ์"
              value={insuranceSearch}
              onChange={(e) => setInsuranceSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setAppliedInsuranceSearch(insuranceSearch.trim());
              }}
            />
            <Select
              size="md"
              className="w-[170px]"
              label="สถานะกรมธรรม์"
              placeholder="เลือกสถานะ"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "ทั้งหมด", value: "" },
                { label: "คุ้มครอง", value: "A" },
                { label: "หมดอายุ", value: "E" },
              ]}
            />
            <Select
              size="md"
              className="w-[170px]"
              label="ประเภทประกัน"
              placeholder="เลือกประเภท"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v)}
              options={typeOptions}
            />
          </div>

          {/* Insurance Cards */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {filteredInsurance.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูลกรมธรรม์</div>
            ) : (
              filteredInsurance.map((item) => (
                <InsuranceCard key={item.id} item={item} />
              ))
            )}
          </div>
        </section>

        {/* Right Panel */}
        <aside className="rounded-[24px] bg-white p-6 self-start">
          <div className="border-b border-[#EAEAEA] pb-5">
            <h2 className="text-lg font-bold text-[#243333]">ข้อมูลการเคลม</h2>
          </div>

          {claims.length === 0 && claimTotalPages >= 1 && claimPage > 0 ? (
            claimTotalPages === 1 && claimPage === 1 ? (
              <div className="mt-5 flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#9CA3AF]">ยังไม่มีข้อมูลการเคลม</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-[14px] border border-[#EAEAEA] p-4 h-[158px]">
                    <div className="space-y-2 animate-pulse">
                      <div className="flex justify-between">
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                        <div className="h-4 w-16 bg-gray-100 rounded-full" />
                      </div>
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="mt-5 space-y-3">
              {claims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          )}

          {claimTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={claimPage <= 1}
                onClick={() => handleClaimPageChange(claimPage - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-[#9CA3AF]">{claimPage} / {claimTotalPages}</span>
              <button
                disabled={claimPage >= claimTotalPages}
                onClick={() => handleClaimPageChange(claimPage + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#EAEAEA] text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
const claimStatusColor: Record<string, string> = {
  INPROGRESS: "#FF944D",
  HOLD: "#2D7CA4",
  REJECT: "#F44034",
  APPROVED: "#24A148",
};

const claimStatusLabel: Record<string, string> = {
  INPROGRESS: "อยู่ระหว่างดำเนินการ",
  HOLD: "รอเอกสารเพิ่มเติม",
  REJECT: "ปฏิเสธการจ่าย",
  APPROVED: "อนุมัติ",
};

const claimConsiderLabel: Record<string, string> = {
  PENDING: "อยู่ระหว่างดำเนินการ",
  REPAIR: "ซ่อม",
  REPLACEMENT: "เปลี่ยนเครื่อง",
  SWAP: "เปลี่ยนเครื่อง",
  REJECT: "ปฏิเสธการจ่าย",
};

function ClaimCard({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  const [statuses, setStatuses] = useState<ClaimStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  const color = claimStatusColor[claim.status] || "#9CA3AF";
  const label = claimStatusLabel[claim.status] || claim.status;
  const considerLabel = claimConsiderLabel[claim.statusConsider] || claim.statusConsider;

  const handleToggle = async () => {
    if (!expanded && statuses.length === 0) {
      setLoadingStatuses(true);
      const res = await claimApi.getStatuses(claim.id).catch(() => null);
      if (res?.success) setStatuses(res.data);
      setLoadingStatuses(false);
    }
    setExpanded(!expanded);
  };

  return (
    <div className={`rounded-[14px] border transition-all duration-200 overflow-hidden cursor-pointer ${
      expanded ? "border-primary/40 shadow-sm" : "border-[#EAEAEA] hover:border-primary/30"
    }`}>
      <div
        onClick={handleToggle}
        className="p-4"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9CA3AF]">เลขที่คำร้องเคลม</p>
            <span className="rounded-full px-3 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: color }}>
              {label}
            </span>
          </div>
          <p className="text-sm font-bold text-[#243333]">{claim.code}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9CA3AF]">วันที่ยื่นคำร้อง</p>
            <p className="text-xs font-medium text-[#565656]">
              {new Date(claim.createdOn).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9CA3AF]">ผลพิจารณา</p>
            <p className="text-xs font-medium text-[#565656]">{considerLabel}</p>
          </div>
        </div>
        <p className="text-center text-[11px] text-primary/70 mt-3">
          {expanded ? "ซ่อน" : "ดูไทม์ไลน์"}
        </p>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 border-t border-[#F5F5F5]">
            <p className="text-xs font-medium text-[#9CA3AF] mb-3">ไทม์ไลน์</p>
            {loadingStatuses ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            ) : statuses.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">ไม่พบข้อมูล</p>
            ) : (
              <div className="relative pl-4">
                <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[#EAEAEA]" />
                {statuses.map((s, idx) => (
                  <div key={s.id} className="relative flex items-start gap-3 pb-3 last:pb-0">
                    <div className={`relative z-10 mt-0.5 w-[10px] h-[10px] rounded-full border-2 ${
                      idx === statuses.length - 1
                        ? "border-primary bg-primary"
                        : "border-[#DCDCDC] bg-white"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#243333]">{s.label}</p>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {new Date(s.createdOn).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsuranceCard({ item }: { item: MemberInsuranceItem }) {
  const isActive = item.status === "ACTIVE";

  return (
    <div className="relative rounded-[20px] border border-[#EAEAEA] bg-white p-6 transition hover:border-[#07A2A2] hover:shadow-sm">
      <div className="mb-7">
        <p className="text-xs text-[#9CA3AF]">ผลิตภัณฑ์</p>
        <h3 className="mt-1 text-[15px] font-bold text-[#111827]">{item.productName}</h3>
      </div>

      <span
        className={`absolute right-5 top-5 rounded-full px-4 py-1.5 text-xs font-medium text-white ${isActive ? "bg-[#07A2A2]" : "bg-[#F44034]"}`}
      >
        {isActive ? "คุ้มครอง" : "หมดอายุ"}
      </span>

      <div className="space-y-5 text-sm">
        <InfoRow label="ประเภท" value={item.type} />
        <InfoRow label="วันเริ่มคุ้มครอง" value={new Date(item.effectiveOn).toLocaleDateString("th-TH")} />
        <InfoRow label="วันสิ้นสุด" value={new Date(item.expireOn).toLocaleDateString("th-TH")} />
        <InfoRow label="ทุนประกัน" value={`${Number(item.sumInsured).toLocaleString()} บาท`} />
        {item.brand && <InfoRow label="ยี่ห้อ/รุ่น" value={`${item.brand} ${item.model}`} />}
        {item.imei && <InfoRow label="IMEI" value={item.imei} />}
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
