import type { Metadata } from "next";
import GestorRelatoriosKpisClient from "@/app/(gestor)/gestor/relatorios-kpis/ui/gestor-relatorios-kpis-client";

export const metadata: Metadata = {
  title: "Relatórios & KPIs | Frota+",
};

export default function GestorRelatoriosPage() {
  return <GestorRelatoriosKpisClient />;
}

