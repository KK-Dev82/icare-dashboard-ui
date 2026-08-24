"use client";

import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { BreadcrumbProvider } from "@/components/layout/BreadcrumbContext";
import { ErrorState } from "@/components/ui/error-state";
import { ToastProvider } from "@/components/ui/toast";
import {
  PermissionProvider,
  usePermissions,
} from "@/contexts/PermissionContext";
import { canAccessPath } from "@/lib/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <PermissionProvider>
        <DashboardShell>{children}</DashboardShell>
      </PermissionProvider>
    </ToastProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile,
    permissions,
    isSuperAdmin,
    loading,
    errorMessage,
    refetchProfile,
  } = usePermissions();
  const canAccess = canAccessPath(pathname, permissions, isSuperAdmin);

  useEffect(() => {
    if (!loading && profile && !canAccess) {
      router.replace("/403");
    }
  }, [canAccess, loading, profile, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoaderCircle className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!profile && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-[#EAEAEA] bg-white px-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <ErrorState
            message={errorMessage}
            onRetry={() => void refetchProfile()}
          />
        </div>
      </div>
    );
  }

  if (!profile || !canAccess) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8">
        <div className="mx-auto w-full max-w-[1612px]">
          <BreadcrumbProvider>
            <Breadcrumb />
            {children}
          </BreadcrumbProvider>
        </div>
      </main>
    </div>
  );
}
