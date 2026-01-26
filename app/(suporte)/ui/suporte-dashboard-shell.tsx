"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { DemoSession } from "@/app/lib/demo-auth";
import SuporteSidebar from "@/app/(suporte)/ui/sidebar/suporte-sidebar";
import ClientTopbar from "@/app/(client)/ui/topbar/client-topbar";

const TITLE_BY_PATH: Record<string, string> = {
  "/suporte": "Dashboard Suporte",
  "/suporte/fila-tickets": "Fila de Tickets",
  "/suporte/status-postos": "Status dos Postos",
  "/suporte/consulta-clientes": "Consulta Clientes",
  "/suporte/configuracoes": "Configurações",
};

export default function SuporteDashboardShell({
  session,
  children,
}: {
  session: DemoSession;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? "Dashboard Suporte";

  const notifications = [
    {
      id: "s1",
      title: "Tickets em aberto",
      description: "Existem solicitações aguardando resposta.",
      timeLabel: "HOJE",
      unread: true,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="flex min-h-screen">
        <SuporteSidebar session={session} />

        <div className="flex min-h-screen flex-1 flex-col">
          <ClientTopbar title={title} notifications={notifications} />
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

