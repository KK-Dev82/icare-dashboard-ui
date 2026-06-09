"use client";

import { X } from "lucide-react";
import type {
  ContactCaseStatus,
  ContactCase,
  ContactCaseReadStatus,
} from "@/types/contact-case";

interface ContactCaseDetailModalProps {
  open: boolean;
  contactCase: ContactCase | null;
  onClose: () => void;
}

const readStatusConfig: Record<ContactCaseReadStatus, { label: string; color: string }> = {
  READ: { label: "อ่านแล้ว", color: "#2D7CA4" },
  UNREAD: { label: "ยังไม่ได้อ่าน", color: "#FF944D" },
};

const caseStatusLabel: Record<ContactCaseStatus, string> = {
  NEW: "ใหม่",
  IN_PROGRESS: "กำลังดำเนินการ",
  CLOSED: "ปิดเคสแล้ว",
};

export function ContactCaseDetailModal({
  open,
  contactCase,
  onClose,
}: ContactCaseDetailModalProps) {
  if (!open || !contactCase) return null;

  const readStatus = readStatusConfig[contactCase.readStatus];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-[20px] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
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
        <p className="mt-1 text-sm leading-5 text-[#9CA3AF]">{contactCase.caseNo}</p>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoItem
            label="ผู้ติดต่อ (เบอร์โทรศัพท์)"
            value={contactCase.contactPhone}
          />
          <InfoItem
            label="สถานะการอ่าน"
            value={readStatus.label}
            valueClassName="font-medium"
            valueStyle={{ color: readStatus.color }}
          />
          <InfoItem
            label="ชื่อผู้ติดต่อ"
            value={contactCase.contactName || "-"}
          />
          <InfoItem
            label="สถานะเคส"
            value={caseStatusLabel[contactCase.caseStatus]}
          />
        </div>

        <div className="mt-5 space-y-5">
          <InfoItem label="วันที่ส่ง:" value={formatDate(contactCase.submittedAt)} />
          <InfoItem label="ประเภท" value={contactCase.category?.name ?? "-"} />
          <InfoItem label="หัวข้อ" value={contactCase.subject} />
          <InfoItem label="รายละเอียด" value={contactCase.message || "-"} multiline />
          {contactCase.contactEmail && (
            <InfoItem label="อีเมล" value={contactCase.contactEmail} />
          )}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
