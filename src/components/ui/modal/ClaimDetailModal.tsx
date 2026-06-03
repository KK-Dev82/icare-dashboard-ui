"use client";

import { X } from "lucide-react";
import type {
  ClaimRequest,
  ClaimRequestCategory,
  ClaimRequestStatus,
} from "@/types/claim";

type ClaimWithDetail = ClaimRequest & {
  description?: string | null;
  detail?: string | null;
  details?: string | null;
};

interface ClaimDetailModalProps {
  open: boolean;
  claim: ClaimWithDetail | null;
  onClose: () => void;
}

const categoryLabel: Record<ClaimRequestCategory, string> = {
  QUESTION: "สอบถาม",
  USAGE_PROBLEM: "ปัญหาใช้งาน",
  SUGGESTION: "ข้อเสนอแนะ",
  SERVICE_COMPLAINT: "ร้องเรียนบริการ",
};

const statusConfig: Record<ClaimRequestStatus, { label: string; color: string }> = {
  READ: { label: "อ่านแล้ว", color: "#2D7CA4" },
  UNREAD: { label: "ยังไม่ได้อ่าน", color: "#FF944D" },
};

export function ClaimDetailModal({
  open,
  claim,
  onClose,
}: ClaimDetailModalProps) {
  if (!open || !claim) return null;

  const status = statusConfig[claim.status];
  const detail = claim.description || claim.detail || claim.details || claim.title;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[20px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF944D] text-white transition-opacity hover:opacity-85"
          aria-label="ปิด"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-lg font-bold leading-6 text-[#243333]">
          ข้อมูลคำร้อง
        </h2>
        <p className="mt-1 text-sm leading-5 text-[#9CA3AF]">{claim.requestNo}</p>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoItem label="ผู้ติดต่อ (เบอร์โทรศัพท์)" value={claim.phone} />
          <InfoItem
            label="สถานะ"
            value={status.label}
            valueClassName="font-medium"
            valueStyle={{ color: status.color }}
          />
        </div>

        <div className="mt-5 space-y-5">
          <InfoItem label="วันที่ส่ง:" value={formatClaimDate(claim.submittedAt)} />
          <InfoItem label="ประเภท" value={categoryLabel[claim.category]} />
          <InfoItem label="หัวข้อ" value={claim.title} />
          <InfoItem label="รายละเอียด" value={detail} multiline />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  multiline = false,
  valueClassName = "",
  valueStyle,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  valueClassName?: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <p className="text-xs font-semibold leading-5 text-[#707070]">{label}</p>
      <p
        className={`mt-0.5 text-sm leading-5 text-[#9FA2A9] ${
          multiline ? "whitespace-pre-line" : ""
        } ${valueClassName}`}
        style={valueStyle}
      >
        {value}
      </p>
    </div>
  );
}

function formatClaimDate(value: string) {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-");
  const monthNames: Record<string, string> = {
    "01": "ม.ค.",
    "02": "ก.พ.",
    "03": "มี.ค.",
    "04": "เม.ย.",
    "05": "พ.ค.",
    "06": "มิ.ย.",
    "07": "ก.ค.",
    "08": "ส.ค.",
    "09": "ก.ย.",
    "10": "ต.ค.",
    "11": "พ.ย.",
    "12": "ธ.ค.",
  };

  const dateText = `${Number(day)} ${monthNames[month] ?? month} ${year}`;

  if (!timePart) return dateText;

  const [hour, minute] = timePart.split(":");
  return `${dateText} เวลา ${hour}:${minute} น.`;
}
