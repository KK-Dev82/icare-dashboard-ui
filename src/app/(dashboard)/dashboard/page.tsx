import { ContactCasesWidget } from "./components/ContactCasesWidget";
import { NewMembersReport } from "./components/NewMembersReport";
import { SummarySection } from "./components/SummarySection";

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <SummarySection />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <NewMembersReport />
        <ContactCasesWidget />
      </div>
    </div>
  );
}
