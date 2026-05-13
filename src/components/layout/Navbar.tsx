"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Package,
  UserCog,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "สมาชิก", href: "/members", icon: Users },
  { label: "ข่าวสาร / โปรโมชั่น", href: "/news", icon: Newspaper },
  { label: "จัดการผลิตภัณฑ์", href: "/policies", icon: Package },
  { label: "ผู้ใช้งาน", href: "/policy-categories", icon: UserCog },
  { label: "การตั้งค่า", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [fullName, setFullName] = useState("Admin");
  const [role, setRole] = useState("");

  useEffect(() => {
    setFullName(localStorage.getItem("fullName") || "Admin");
    setRole(localStorage.getItem("role") || "");
  }, []);

  return (
    <header className="sticky top-0 z-50 border-t-[3px] border-t-primary bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="h-[72px] flex items-center justify-between px-8">
        {/* Left - Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">iC</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            iCare <span className="text-primary">Insurance</span>
          </span>
        </Link>

        {/* Center - Navigation */}
        <nav className="flex items-center gap-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <item.icon size={18} strokeWidth={1.8} />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right - Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <Bell size={20} strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAEAEA] hover:border-primary/30 hover:bg-primary/5 transition-all">
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {fullName.charAt(0)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700 leading-tight">{fullName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
