"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import type { AppSession } from "@/app/lib/auth/session";
import AdminSidebar from "@/app/(admin)/ui/sidebar/admin-sidebar";
import ClientTopbar from "@/app/(client)/ui/topbar/client-topbar";

const TITLE_BY_PATH: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/empresas": "Empresas / Frotas",
  "/admin/utilizadores": "Utilizadores",
  "/admin/configuracoes": "Configurações",
};

export default function AdminDashboardShell({ session, children }: { session: AppSession; children: ReactNode }) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="flex min-h-screen">
        <AdminSidebar session={session} />
        <div className="flex min-h-screen flex-1 flex-col">
          <ClientTopbar title={title} notifications={[]} />
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
