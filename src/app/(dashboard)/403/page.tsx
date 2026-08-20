"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionContext";

export default function ForbiddenPage() {
  const { defaultRoute } = usePermissions();

  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl border border-[#EAEAEA] bg-white px-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC] text-[#F44034]">
        <ShieldX size={34} />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-[#243333]">
        ไม่มีสิทธิ์เข้าถึงหน้านี้
      </h1>
      <p className="mt-2 max-w-md text-sm text-[#9CA3AF]">
        บัญชีของคุณไม่ได้รับสิทธิ์สำหรับเมนูนี้ กรุณาติดต่อผู้ดูแลระบบหากต้องการเข้าใช้งาน
      </p>
      {defaultRoute !== "/403" && (
        <Link
          href={defaultRoute}
          className="mt-6 rounded-[10px] bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          กลับหน้าหลัก
        </Link>
      )}
    </div>
  );
}
