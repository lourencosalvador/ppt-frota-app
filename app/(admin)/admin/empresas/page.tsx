import type { Metadata } from "next";
import AdminEmpresasClient from "@/app/(admin)/admin/empresas/ui/admin-empresas-client";

export const metadata: Metadata = { title: "Empresas / Frotas | Frota+" };

export default function Page() {
  return <AdminEmpresasClient />;
}
