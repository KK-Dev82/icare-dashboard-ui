"use client";

import { usePermissions } from "@/contexts/PermissionContext";
import { ContactCasesWidget } from "./components/ContactCasesWidget";
import { NewMembersReport } from "./components/NewMembersReport";
import { SummarySection } from "./components/SummarySection";

export default function DashboardPage() {
  const { hasPermission } = usePermissions();
  const canViewMembers = hasPermission("MEMBERS");
  const canViewContactCases = hasPermission("CONTACT_CASE");
  const hasBothWidgets = canViewMembers && canViewContactCases;

  return (
    <div className="w-full space-y-6">
      <SummarySection />
      {(canViewMembers || canViewContactCases) && (
        <div
          className={`grid grid-cols-1 items-start gap-6 ${
            hasBothWidgets
              ? "xl:grid-cols-5"
              : canViewMembers
                ? "xl:grid-cols-3"
                : "xl:grid-cols-2"
          }`}
        >
          {canViewMembers && <NewMembersReport />}
          {canViewContactCases && <ContactCasesWidget />}
        </div>
      )}
    </div>
  );
}
