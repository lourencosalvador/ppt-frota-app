import type { Metadata } from "next";
import AdminDashboardClient from "@/app/(admin)/admin/ui/admin-dashboard-client";

export const metadata: Metadata = { title: "Dashboard Admin | Frota+" };

export default function Page() {
  return <AdminDashboardClient />;
}
