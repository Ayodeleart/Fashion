import AdminNav from "@/components/admin/AdminNav";
import RegisterSW from "@/components/admin/RegisterSW";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper text-ink">
      <RegisterSW />
      <AdminNav />
      <div className="flex-1 min-w-0 p-6 md:p-10">{children}</div>
    </div>
  );
}
