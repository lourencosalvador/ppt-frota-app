"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { DemoSession } from "@/app/lib/demo-auth";
import ClientSidebar from "@/app/(client)/ui/sidebar/client-sidebar";
import ClientTopbar from "@/app/(client)/ui/topbar/client-topbar";

const TITLE_BY_PATH: Record<string, string> = {
  "/home": "Meu Painel",
  "/meus-pedidos": "Meus Pedidos",
  "/meus-cartoes": "Meus Cartões",
  "/postos-parceiros": "Postos Parceiros",
};

export default function ClientDashboardShell({
  session,
  children,
}: {
  session: DemoSession;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? "Meu Painel";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="flex min-h-screen">
        <ClientSidebar session={session} />

        <div className="flex min-h-screen flex-1 flex-col">
          <ClientTopbar title={title} />
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

