"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import iciLogo from "@/../assets/ici.png";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Newspaper,
  Package,
  UserCog,
  Settings,
  History,
  ShieldCheck,
  ChevronDown,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "สมาชิก", href: "/members", icon: Users },
  { label: "ข่าวสาร / โปรโมชั่น", href: "/news", icon: Newspaper },
  { label: "จัดการผลิตภัณฑ์", href: "/policies", icon: Package },
  {
    label: "คำร้อง / ติดต่อ",
    href: "/contact-case",
    icon: MapPin,
    children: [
      { label: "คำร้องขอติดต่อ", href: "/contact-case" },
      { label: "ความสนใจผลิตภัณฑ์/คอนเทนต์", href: "/product-interest" },
    ],
  },
  { label: "ผู้ใช้งาน", href: "/accounts", icon: UserCog },
  { label: "ประวัติการใช้งาน", href: "/activity-log", icon: History, superAdminOnly: true },
  { label: "การตั้งค่า", href: "/settings", icon: Settings },
  { label: "การยินยอม", href: "/consents", icon: ShieldCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [fullName, setFullName] = useState("Admin");
  const [role, setRole] = useState("");
  const [navDropdownOpen, setNavDropdownOpen] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFullName(localStorage.getItem("fullName") || "Admin");
      setRole(localStorage.getItem("role") || "");
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setNavDropdownOpen(null);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwLoading(true);
    try {
      const { data } = await apiClient.patch("/api/v1/admin/profile/password", {
        oldPassword,
        newPassword,
      });
      if (data.success) {
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        setPwError(data.message || "เกิดข้อผิดพลาด");
      }
    } catch {
      setPwError("รหัสผ่านเดิมไม่ถูกต้อง");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-t-[3px] border-t-primary bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="h-[72px] flex items-center justify-between px-8">
          {/* Left - Logo */}
          <Link href="/dashboard" className="flex items-center shrink-0">
            <Image src={iciLogo} alt="ICI Logo" height={40} className="w-auto" />
          </Link>

          {/* Center - Navigation */}
          <nav ref={navRef} className="flex h-full items-center gap-1 overflow-x-auto">
            {menuItems
              .filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN")
              .map((item) => {
              const childActive = item.children?.some((child) => pathname.startsWith(child.href));
              const isActive = childActive || pathname.startsWith(item.href);
              const hasChildren = Boolean(item.children?.length);

              if (hasChildren) {
                return (
                  <div key={item.href} className="relative h-full">
                    <button
                      type="button"
                      onClick={() =>
                        setNavDropdownOpen((current) => (current === item.href ? null : item.href))
                      }
                      className={`relative flex h-full items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium transition-all 2xl:gap-2 2xl:px-4 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-500 hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      <item.icon size={18} strokeWidth={1.8} />
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          navDropdownOpen === item.href ? "rotate-180" : ""
                        }`}
                      />
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-primary" />
                      )}
                    </button>

                    {navDropdownOpen === item.href && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-[210px] rounded-[12px] border border-[#EAEAEA] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                        {item.children?.map((child) => {
                          const isChildActive = pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setNavDropdownOpen(null)}
                              className={`block px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                                isChildActive
                                  ? "text-primary"
                                  : "text-[#243333] hover:bg-[#EDF9F9] hover:text-primary"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-full items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium transition-all 2xl:gap-2 2xl:px-4 ${
                    isActive
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right - Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* <button className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Bell size={20} strokeWidth={1.8} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button> */}

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAEAEA] hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {fullName.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 leading-tight">{fullName}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{role}</p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-xl border border-[#EAEAEA] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1.5 z-50">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#565656] hover:bg-[#EDF9F9] transition-colors"
                  >
                    <KeyRound size={16} />
                    เปลี่ยนรหัสผ่าน
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#F44034] hover:bg-[#FDECEC] transition-colors"
                  >
                    <LogOut size={16} />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPasswordModal(false)} />
          <div className="relative bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 w-full max-w-[400px]">
            <h2 className="text-lg font-bold text-[#243333] mb-6">เปลี่ยนรหัสผ่าน</h2>

            {pwError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FDECEC] text-[#F44034] text-sm">
                {pwError}
              </div>
            )}

            <div className="space-y-4">
              <Input
                size="lg"
                className="w-full"
                label="รหัสผ่านเดิม"
                type="password"
                placeholder="กรอกรหัสผ่านเดิม"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <Input
                size="lg"
                className="w-full"
                label="รหัสผ่านใหม่"
                type="password"
                placeholder="กรอกรหัสผ่านใหม่"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPwError("");
                  setOldPassword("");
                  setNewPassword("");
                }}
                className="h-[40px] px-5 rounded-[10px] border border-[#DCDCDC] text-sm font-medium text-[#565656] hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwLoading || !oldPassword || !newPassword}
                className="h-[40px] px-5 rounded-[10px] bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pwLoading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
