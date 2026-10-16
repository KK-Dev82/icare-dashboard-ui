"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Download, FileText, LoaderCircle, Power } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { memberApi } from "@/api/member";
import { claimApi } from "@/api/claim";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal, MemberConsentHistoryModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type {
  EditableMemberStatus,
  Member,
  MemberInsuranceItem,
  MemberNotificationPreference,
} from "@/types/member";
import type { Claim, ClaimStatus } from "@/types/claim";

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();
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
  const [notificationPreference, setNotificationPreference] =
    useState<MemberNotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [consentHistoryOpen, setConsentHistoryOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!statusMenuRef.current?.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStatusMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [statusMenuOpen]);

  const handleStatusSelection = async (status: EditableMemberStatus) => {
    if (!member || statusUpdating || member.status === status) return;

    setStatusUpdating(true);
    try {
      const response = await memberApi.updateStatus(member.id, status);
      if (!response.success) {
        toast.error(response.message || "อัปเดตสถานะบัญชีไม่สำเร็จ");
        return;
      }

      setMember((current) => current ? {
        ...current,
        status: response.data.status,
        devices: status === "INACTIVE"
          ? current.devices?.map((device) => ({ ...device, isActive: false }))
          : current.devices,
      } : current);
      setCloseConfirmOpen(false);
      toast.success(status === "ACTIVE" ? "เปิดการใช้งานบัญชีสำเร็จ" : "ปิดการใช้งานบัญชีสำเร็จ");
    } catch (error) {
      toast.fromError(error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const fetchData = () => {
    setLoading(true);
    setErrorMessage(null);
    setNotificationPreference(null);
    Promise.all([
      memberApi.getById(id),
      memberApi.getInsurance(id).catch(() => null),
      memberApi.getNotificationPreferences(id).catch(() => null),
    ]).then(async ([memberRes, insuranceRes, preferenceRes]) => {
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
      if (preferenceRes?.success && preferenceRes.data) {
        setNotificationPreference(preferenceRes.data);
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
    const searchText = item.productName || "";
    if (appliedInsuranceSearch) {
      const kw = appliedInsuranceSearch.toLowerCase();
      const matchName = searchText.toLowerCase().includes(kw);
      const matchBrand = (item.brand || "").toLowerCase().includes(kw);
      if (!matchName && !matchBrand) return false;
    }
    if (statusFilter && item.status !== statusFilter) return false;
    if (typeFilter && item.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4FAFA] p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Content */}
        <section className="rounded-[24px] bg-white p-6">
          <div className="border-b border-[#EAEAEA] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-[#243333]">ข้อมูลสมาชิก</h1>
                  <p className="break-all text-sm text-[#9CA3AF]">ID: {member.id}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-4 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: member.accountLevel === "CUSTOMER" ? "#07A2A2" : "#FF944D" }}
                >
                  {member.accountLevel === "CUSTOMER" ? "ลูกค้า" : "สมาชิก"}
                </span>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setConsentHistoryOpen(true)}
                  className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#DCDCDC] bg-white px-4 text-sm font-medium text-[#565656] transition-colors hover:border-[#07A2A2] hover:text-[#07A2A2] sm:flex-none"
                >
                  <FileText size={16} />
                  ประวัติการยินยอมนโยบาย
                </button>
                <div ref={statusMenuRef} className="relative min-w-[220px] flex-1 sm:flex-none">
                <button
                  type="button"
                  aria-expanded={statusMenuOpen}
                  disabled={statusUpdating}
                  onClick={() => setStatusMenuOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-[10px] border border-[#DCDCDC] bg-white px-4 py-2 text-left transition-colors hover:border-[#07A2A2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#07A2A2] disabled:cursor-wait disabled:opacity-70"
                >
                  <span>
                    <span className="block text-[11px] font-medium text-[#707070]">สถานะการใช้งานบัญชี</span>
                    <span className={`block text-sm font-semibold ${member.status === "ACTIVE" ? "text-[#24A148]" : "text-[#F44034]"}`}>
                      {member.status === "ACTIVE" ? "เปิดการใช้งาน" : member.status === "SUSPENDED" ? "ระงับการใช้งาน" : "ปิดการใช้งาน"}
                    </span>
                  </span>
                  {statusUpdating
                    ? <LoaderCircle size={16} className="animate-spin text-[#07A2A2]" />
                    : <ChevronDown size={16} className={`text-[#213F3F] transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />}
                </button>
                {statusMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[270px] rounded-[16px] border border-[#EAEAEA] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      disabled={statusUpdating || member.status === "ACTIVE"}
                      onClick={() => {
                        setStatusMenuOpen(false);
                        handleStatusSelection("ACTIVE");
                      }}
                      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left hover:bg-[#F1FAF5] disabled:cursor-default disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF8EF] text-[#24A148]"><Power size={20} /></span>
                      <span><span className="block text-sm font-semibold text-[#243333]">เปิดการใช้งาน</span><span className="block text-xs text-[#9CA3AF]">อนุญาตให้เข้าถึงบัญชี</span></span>
                    </button>
                    <button
                      type="button"
                      disabled={statusUpdating || member.status === "INACTIVE"}
                      onClick={() => {
                        setStatusMenuOpen(false);
                        setCloseConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left hover:bg-[#FFF4F3] disabled:cursor-default disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF0EF] text-[#F44034]"><Power size={20} /></span>
                      <span><span className="block text-sm font-semibold text-[#243333]">ปิดการใช้งาน</span><span className="block text-xs text-[#9CA3AF]">ระงับการเข้าถึงชั่วคราว</span></span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Member Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(350px,1fr)_190px_190px]">
            <div className="relative overflow-hidden rounded-[20px] bg-[#07A2A2] p-6 text-white">
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10" />
              <div className="relative grid grid-cols-2 gap-y-3 text-sm">
                <InfoWhite label="ชื่อ - นามสกุล:" value={fullName} />
                <InfoWhite label="อีเมล:" value={member.email || "-"} />
                <InfoWhite label="เบอร์โทรศัพท์:" value={member.phone} />
                <InfoWhite label="สถานะ:" value={member.status === "ACTIVE" ? "ใช้งานอยู่" : member.status === "SUSPENDED" ? "ระงับการใช้งาน" : "ปิดใช้งาน"} />
                <InfoWhite label="ยืนยันเบอร์:" value={member.isPhoneVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"} />
                <InfoWhite label="วันสมัคร:" value={new Date(member.createdAt).toLocaleDateString("th-TH")} />
                <InfoWhite label="เลขบัตรประชาชน:" value={member.nationalId || "-"} />
                <InfoWhite label="FCM Token:" value={formatFcmTokenStatus(member)} />
              </div>
            </div>

            <NotificationStatusCard preference={notificationPreference} />

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
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInsurance.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-[#9CA3AF]">ไม่พบข้อมูลกรมธรรม์</div>
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
      <ConfirmModal
        open={closeConfirmOpen}
        title="ปิดการใช้งาน"
        message={`ต้องการปิดการใช้งานบัญชี “${fullName}” ใช่หรือไม่?`}
        confirmLabel="ปิดการใช้งาน"
        confirmColor="danger"
        loading={statusUpdating}
        onConfirm={() => handleStatusSelection("INACTIVE")}
        onCancel={() => {
          if (!statusUpdating) setCloseConfirmOpen(false);
        }}
      />
      {consentHistoryOpen && (
        <MemberConsentHistoryModal
          open
          userId={member.id}
          onClose={() => setConsentHistoryOpen(false)}
        />
      )}
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
  const policyDocumentUrl = item.policies
    ?.find((policy) => policy.documentUrl?.trim())
    ?.documentUrl?.trim();
  const certificateDocumentUrl = item.certificateDocumentUrl?.trim();
  const hasDocuments = Boolean(policyDocumentUrl || certificateDocumentUrl);

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-[#EAEAEA] bg-white p-6 transition hover:border-[#07A2A2] hover:shadow-sm">
      <div className="mb-7">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-[#9CA3AF]">ผลิตภัณฑ์</p>
          <span
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium text-white ${isActive ? "bg-[#07A2A2]" : "bg-[#F44034]"}`}
          >
            {isActive ? "คุ้มครอง" : "หมดอายุ"}
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-bold text-[#111827]">{item.productName}</h3>
      </div>

      <div className="flex-1 space-y-5 text-sm">
        <InfoRow label="ประเภท" value={item.type} />
        <InfoRow label="วันเริ่มคุ้มครอง" value={new Date(item.effectiveOn).toLocaleDateString("th-TH")} />
        <InfoRow label="วันสิ้นสุด" value={new Date(item.expireOn).toLocaleDateString("th-TH")} />
        <InfoRow label="ทุนประกัน" value={`${Number(item.sumInsured).toLocaleString()} บาท`} />
        {item.brand && <InfoRow label="ยี่ห้อ/รุ่น" value={`${item.brand} ${item.model}`} />}
        {item.imei && <InfoRow label="IMEI" value={item.imei} />}
      </div>

      {hasDocuments && (
        <div className="mt-6 space-y-2">
          {policyDocumentUrl && (
            <DocumentDownloadButton href={policyDocumentUrl} label="ดาวน์โหลดกรมธรรม์" />
          )}
          {certificateDocumentUrl && (
            <DocumentDownloadButton
              href={certificateDocumentUrl}
              label="ดาวน์โหลดใบรับรองสิทธิ์"
            />
          )}
        </div>
      )}
    </div>
  );
}

function DocumentDownloadButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#FF944D] bg-[#FF944D] text-sm font-medium text-white transition-colors hover:border-[#F48338] hover:bg-[#F48338]"
    >
      <Download size={16} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </a>
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
    <div className="grid grid-cols-[90px_1fr] gap-1">
      <p className="text-xs text-white/80">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  );
}

function formatFcmTokenStatus(member: Member) {
  const activeDevice = member.devices?.find(
    (device) => device.isActive && Boolean(device.fcmToken?.trim()),
  );

  if (!activeDevice) return "-";
  if (!activeDevice.lastSeenAt) return "มี Token";

  const date = new Date(activeDevice.lastSeenAt);
  if (Number.isNaN(date.getTime())) return "มี Token";

  return `มี Token ${new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)}`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#9CA3AF]">{label}</span>
      <span className="font-bold text-[#111827]">{value}</span>
    </div>
  );
}

function NotificationStatusCard({
  preference,
}: {
  preference: MemberNotificationPreference | null;
}) {
  return (
    <div className="rounded-[14px] border border-[#EAEAEA] bg-white p-5">
      <h3 className="whitespace-nowrap font-bold text-[#243333]">สถานะการแจ้งเตือน</h3>
      <div className="mt-4 space-y-2 text-xs">
        <NotificationStatusRow label="แจ้งเตือนกรมธรรม์" />
        <NotificationStatusRow label="แจ้งเตือนข่าวสาร" enabled={preference?.news} />
        <NotificationStatusRow label="แนะนำผลิตภัณฑ์" enabled={preference?.product} />
      </div>
    </div>
  );
}

function NotificationStatusRow({
  label,
  enabled,
}: {
  label: string;
  enabled?: boolean;
}) {
  const status = enabled === undefined ? "-" : enabled ? "เปิด" : "ปิด";
  const statusColor =
    enabled === undefined
      ? "text-[#9CA3AF]"
      : enabled
        ? "text-[#24A148]"
        : "text-[#F44034]";

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#9CA3AF]">{label}</span>
      <span className={`font-bold ${statusColor}`}>{status}</span>
    </div>
  );
}
