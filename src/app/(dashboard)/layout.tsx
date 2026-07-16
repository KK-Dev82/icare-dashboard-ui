"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { BreadcrumbProvider } from "@/components/layout/BreadcrumbContext";
import { ToastProvider } from "@/components/ui/toast";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return !!localStorage.getItem("accessToken");
}

function getServerSnapshot() {
  return false;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasToken = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) return null;

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}
