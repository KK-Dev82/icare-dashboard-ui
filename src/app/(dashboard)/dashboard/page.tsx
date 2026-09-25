"use client";

import { usePermissions } from "@/contexts/PermissionContext";
import { ContactCasesWidget } from "./components/ContactCasesWidget";
import { NewMembersReport } from "./components/NewMembersReport";
import { SummarySection } from "./components/SummarySection";
import { SystemStatusSection } from "./components/SystemStatusSection";

export default function DashboardPage() {
  const { hasPermission } = usePermissions();
  const canViewMemberDetail = hasPermission("MEMBERS");

  return (
    <div className="w-full space-y-6">
      <SummarySection />
      <SystemStatusSection />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <NewMembersReport canViewMemberDetail={canViewMemberDetail} />
        <ContactCasesWidget />
      </div>
    </div>
  );
}
