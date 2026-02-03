"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutGrid,
  LogOut,
  MapPinned,
  Settings,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import type { AppSession } from "@/app/lib/auth/session";
import { logout as apiLogout } from "@/app/lib/api/auth";
import NavItem from "@/app/(client)/ui/sidebar/nav-item";
import { Button } from "@/components/ui/button";
import InitialsAvatar from "@/components/ui/initials-avatar";

export default function GestorSidebar({ session }: { session: AppSession }) {
  const router = useRouter();

  async function logout() {
    try {
      await apiLogout();
      toast.success("Sessão terminada.");
    } catch {
      toast.error("Falha ao terminar sessão.");
    } finally {
      router.push("/");
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[264px] flex-col bg-linear-to-b from-[#0B1220] via-[#0B1220] to-[#0D1B2A]">
      <div className="px-6 pt-6">
        <Image
          src="/brand/logo.svg"
          alt="Frota+"
          width={160}
          height={44}
          priority
          className="h-auto w-[140px]"
        />
      </div>

      <div className="mt-8 flex-1 px-4">
        <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          MENU GESTOR
        </div>

        <nav className="mt-3 space-y-1">
          <NavItem href="/gestor" icon={LayoutGrid} label="Visão Geral" />
          <NavItem href="/gestor/tickets" icon={Ticket} label="Gestão de Tickets" />
          <NavItem href="/gestor/postos-abastec" icon={MapPinned} label="Postos & Abastec." />
          <NavItem href="/gestor/relatorios-kpis" icon={BarChart3} label="Relatórios & KPIs" />
          <NavItem href="/gestor/contas-cartoes" icon={CreditCard} label="Contas & Cartões" />
        </nav>

        <div className="mt-8 px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          SISTEMA
        </div>
        <nav className="mt-3 space-y-1">
          <NavItem href="/gestor/configuracoes" icon={Settings} label="Configurações" />
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-3">
          <div className="flex items-center gap-3">
            <InitialsAvatar
              name={session.name || session.email}
              size={36}
              className="border border-white/10"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{session.name}</div>
              <div className="truncate text-[11px] font-semibold text-zinc-400">GESTOR</div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-10 w-10 rounded-xl text-zinc-200 hover:bg-white/10 hover:text-white"
            aria-label="Terminar sessão"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

