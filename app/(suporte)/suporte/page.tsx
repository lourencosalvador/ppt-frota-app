import type { Metadata } from "next";
import SuporteDashboardClient from "@/app/(suporte)/suporte/ui/suporte-dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard Suporte | Frota+",
};

export default function Page() {
  return <SuporteDashboardClient />;
}

