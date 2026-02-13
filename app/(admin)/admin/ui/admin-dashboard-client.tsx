"use client";

import { Building2, ShieldCheck, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardClient() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="text-lg font-extrabold text-zinc-900">Painel Administrador Pumangol</div>
        <div className="mt-1 text-sm font-semibold text-zinc-500">Gestão global do sistema, empresas e utilizadores.</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Building2, value: "—", label: "Empresas Registadas", sub: "A integrar com API", bg: "bg-blue-50", fg: "text-blue-700" },
          { icon: Users, value: "—", label: "Gestores Ativos", sub: "A integrar com API", bg: "bg-emerald-50", fg: "text-emerald-700" },
          { icon: UserPlus, value: "—", label: "Convites Pendentes", sub: "Onboarding em curso", bg: "bg-amber-50", fg: "text-amber-700" },
          { icon: ShieldCheck, value: "—", label: "Utilizadores Suporte", sub: "Equipa técnica", bg: "bg-violet-50", fg: "text-violet-700" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.fg}`}><c.icon className="h-5 w-5" /></div>
            <div className="mt-5 text-2xl font-extrabold text-zinc-900">{c.value}</div>
            <div className="mt-1 text-xs font-semibold text-zinc-500">{c.label}</div>
            <div className="mt-1 text-[10px] font-semibold text-zinc-300">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900"><Building2 className="h-5 w-5 text-blue-600" />Onboarding de Empresas</div>
          <div className="mt-2 text-xs font-semibold text-zinc-500">Regista uma nova empresa/frota e envia o convite ao gestor.</div>
          <div className="mt-5"><Button className="h-10 rounded-xl bg-[#0B1220] px-6 text-sm font-semibold hover:bg-[#0E2236]"><Building2 className="mr-2 h-4 w-4" />Nova Empresa</Button></div>
        </div>
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900"><Users className="h-5 w-5 text-emerald-600" />Gestão de Utilizadores</div>
          <div className="mt-2 text-xs font-semibold text-zinc-500">Cria administradores, suporte técnico e gestores de frota.</div>
          <div className="mt-5"><Button className="h-10 rounded-xl bg-emerald-600 px-6 text-sm font-semibold hover:bg-emerald-700"><UserPlus className="mr-2 h-4 w-4" />Novo Utilizador</Button></div>
        </div>
      </div>
    </div>
  );
}
