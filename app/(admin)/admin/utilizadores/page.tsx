import type { Metadata } from "next";
import AdminUtilizadoresClient from "@/app/(admin)/admin/utilizadores/ui/admin-utilizadores-client";

export const metadata: Metadata = { title: "Utilizadores | Frota+" };

export default function Page() {
  return <AdminUtilizadoresClient />;
}
