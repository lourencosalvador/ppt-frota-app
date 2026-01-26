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

import type { DemoSession } from "@/app/lib/demo-auth";
import { SESSION_STORAGE_KEY } from "@/app/lib/demo-auth";
import NavItem from "@/app/(client)/ui/sidebar/nav-item";
import { Button } from "@/components/ui/button";
import perfilImg from "@/app/assets/image/perfil.png";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export default function GestorSidebar({ session }: { session: DemoSession }) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    toast.success("Sessão terminada.");
    router.push("/");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[264px] flex-col bg-gradient-to-b from-[#0B1220] via-[#0B1220] to-[#0D1B2A]">
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
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-emerald-600/20">
              <Image
                src={perfilImg}
                alt="Foto de perfil"
                fill
                sizes="36px"
                className="object-cover"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-200 opacity-0">
                {initials(session.name || session.email)}
              </span>
            </div>
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

