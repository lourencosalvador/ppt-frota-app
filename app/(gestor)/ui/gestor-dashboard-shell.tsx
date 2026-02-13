"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { AppSession } from "@/app/lib/auth/session";
import GestorSidebar from "@/app/(gestor)/ui/sidebar/gestor-sidebar";
import ClientTopbar from "@/app/(client)/ui/topbar/client-topbar";

const TITLE_BY_PATH: Record<string, string> = {
  "/gestor": "Visão Geral",
  "/gestor/contas-cartoes": "Cartões & Movimentos",
  "/gestor/colaboradores": "Colaboradores",
  "/gestor/tickets": "Tickets de Suporte",
  "/gestor/postos-abastec": "Postos & Abastec.",
  "/gestor/relatorios-kpis": "Relatórios & KPIs",
  "/gestor/configuracoes": "Configurações",
};

export default function GestorDashboardShell({
  session,
  children,
}: {
  session: AppSession;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? "Visão Geral";

  const notifications = [
    {
      id: "n1",
      title: "Tickets pendentes",
      description: "Existem tickets a aguardar revisão.",
      timeLabel: "HOJE",
      unread: true,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="flex min-h-screen">
        <GestorSidebar session={session} />

        <div className="flex min-h-screen flex-1 flex-col">
          <ClientTopbar title={title} notifications={notifications} />
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

