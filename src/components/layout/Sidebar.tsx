"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Newspaper,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "สมาชิก", href: "/members", icon: Users },
  { label: "กรมธรรม์", href: "/policies", icon: FileText },
  { label: "หมวดหมู่กรมธรรม์", href: "/policy-categories", icon: FolderTree },
  { label: "ข่าวประชาสัมพันธ์", href: "/news", icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-grey/30 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-grey/30">
        <h1 className="text-xl font-bold text-primary">ICI CMS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-dark hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
