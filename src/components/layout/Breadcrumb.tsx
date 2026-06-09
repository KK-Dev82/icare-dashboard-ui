"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  members: "สมาชิก",
  news: "ข่าวสาร / โปรโมชั่น",
  policies: "จัดการผลิตภัณฑ์",
  "contact-case": "คำร้อง / ติดต่อ",
  "policy-categories": "หมวดหมู่ผลิตภัณฑ์",
  accounts: "ผู้ใช้งาน",
  settings: "การตั้งค่า",
  create: "เพิ่มใหม่",
  edit: "แก้ไข",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  // Filter out UUID/ID segments from breadcrumb display
  const displaySegments = segments.filter(
    (seg) => !(seg.length > 8 && /^[0-9a-f-]+$/.test(seg))
  );

  if (displaySegments.length <= 1) return null;

  const crumbs = displaySegments.map((seg, idx) => {
    const href = "/" + segments.slice(0, segments.indexOf(seg) + 1).join("/");
    const isLast = idx === displaySegments.length - 1;
    const label = labelMap[seg] || seg;

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
