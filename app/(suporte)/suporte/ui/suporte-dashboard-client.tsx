"use client";

import GestorOverviewClient from "@/app/(gestor)/gestor/ui/gestor-overview-client";

export default function SuporteDashboardClient() {
  // Reutiliza 1:1 a mesma Visão Geral do Gestor (KPIs, tabs, gráficos e exportações).
  return <GestorOverviewClient />;
}

