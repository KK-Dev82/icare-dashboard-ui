import { type PolicyStatus, statusConfig } from "./policy-card.config";

interface PolicyCardProps {
  policyNumber: string;
  status: PolicyStatus;
  type: string;
  coverageDate: string;
  sumInsured: string;
  licensePlate: string;
  onClick?: () => void;
  selected?: boolean;
}

export function PolicyCard({
  policyNumber,
  status,
  type,
  coverageDate,
  sumInsured,
  licensePlate,
  onClick,
  selected,
}: PolicyCardProps) {
  const badge = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className={`relative w-full rounded-[20px] border bg-white p-6 transition-all cursor-pointer ${
        selected
          ? "border-[#07A2A2] shadow-[0_0_0_1px_#07A2A2]"
          : "border-[#EAEAEA] hover:border-[#07A2A2] hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs text-[#9CA3AF]">เลขที่กรมธรรม์</p>
        <h3 className="mt-1 text-[15px] font-bold text-[#111827]">
          {policyNumber}
        </h3>
      </div>

      {/* Status Badge */}
      <span
        className="absolute right-5 top-5 rounded-full px-4 py-1.5 text-xs font-medium"
        style={{ backgroundColor: badge.bg, color: badge.text }}
      >
        {badge.label}
      </span>

      {/* Content */}
      <div className="space-y-5 text-sm">
        <Row label="ประเภทประกัน" value={type} />
        <Row label="วันที่คุ้มครอง" value={coverageDate} />
        <Row label="ทุนประกัน" value={sumInsured} />
        <Row label="ทะเบียนรถ" value={licensePlate} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="text-right text-sm font-semibold text-[#565656]">{value}</p>
    </div>
  );
}

export function PolicyCardSkeleton() {
  return (
    <div className="w-full rounded-[20px] border border-[#EAEAEA] bg-white p-6 animate-pulse">
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
          <div className="h-5 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[110px_1fr] gap-4">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PolicyCardEmpty() {
  return (
    <div className="w-full rounded-[20px] border border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col items-center justify-center min-h-[220px]">
      <p className="text-sm text-gray-400">ไม่พบข้อมูลกรมธรรม์</p>
    </div>
  );
}
