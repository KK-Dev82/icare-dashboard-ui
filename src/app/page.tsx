"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import { clearAuthSession } from "@/lib/authStorage";
import { getDefaultRoute, getProfilePermissions } from "@/lib/permissions";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function redirectFromSession() {
      if (!localStorage.getItem("accessToken")) {
        router.replace("/login");
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (!active) return;
        if (!response.success) throw new Error("โหลดข้อมูลสิทธิ์ไม่สำเร็จ");

        const profile = response.data;
        const isSuperAdmin = profile.role === "SUPER_ADMIN";
        const hasUsableRole =
          isSuperAdmin || Boolean(profile.roleRef?.isActive);

        if (
          profile.status !== "ACTIVE" ||
          !hasUsableRole
        ) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        router.replace(
          getDefaultRoute(getProfilePermissions(profile), isSuperAdmin)
        );
      } catch {
        if (active) router.replace("/dashboard");
      }
    }

    void redirectFromSession();
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
