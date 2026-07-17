"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { BreadcrumbProvider } from "@/components/layout/BreadcrumbContext";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = !!localStorage.getItem("accessToken");
    setHasToken(token);
    setMounted(true);
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  if (!mounted) return null;
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
