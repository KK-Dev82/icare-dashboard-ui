import Navbar from "@/components/layout/Navbar";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8">
        <div className="mx-auto w-full max-w-[1612px]">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
