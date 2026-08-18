"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbLabels } from "@/components/layout/BreadcrumbContext";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  members: "สมาชิก",
  news: "ข่าวสาร / โปรโมชั่น",
  "news-types": "ประเภทข่าวสาร / โปรโมชั่น",
  policies: "จัดการผลิตภัณฑ์",
  "product-types": "ประเภทผลิตภัณฑ์",
  "contact-case": "คำร้อง / ติดต่อ",
  "product-interest": "ความสนใจผลิตภัณฑ์/คอนเทนต์",
  "policy-categories": "หมวดหมู่ผลิตภัณฑ์",
  accounts: "ผู้ใช้งาน",
  "user-types": "ประเภทผู้ใช้งาน / กำหนดสิทธิ์การใช้งาน",
  "activity-log": "ประวัติการใช้งาน",
  settings: "การตั้งค่า",
  create: "เพิ่มใหม่",
  edit: "แก้ไข",
  consents: "รายการความยินยอม / นโยบาย",
  "consent-types": "ประเภท Consent",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const dynamicLabels = useBreadcrumbLabels();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) return null;

  const crumbs = segments.flatMap((seg, idx) => {
    if (shouldHideEditSegment(segments, idx)) return [];

    const href = "/" + segments.slice(0, idx + 1).join("/");
    const isLast = idx === segments.length - 1;
    const isUuid = seg.length > 8 && /^[0-9a-f-]+$/.test(seg);
    const label =
      dynamicLabels[href] ||
      (isUuid ? "รายละเอียด" : (labelMap[seg] || seg));

    return { label, href, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      <Link href="/dashboard" className="text-[#9CA3AF] hover:text-primary transition-colors">
        <Home size={15} />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-[#D1D5DB]" />
          {crumb.isLast ? (
            <span className="text-[#243333] font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-[#9CA3AF] hover:text-primary transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function shouldHideEditSegment(segments: string[], index: number) {
  const root = segments[0];
  return (
    (root === "news" || root === "policies" || root === "consents") &&
    segments[index] === "edit" &&
    Boolean(segments[index + 1])
  );
}
