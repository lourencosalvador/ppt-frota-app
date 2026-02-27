"use client";

import { useState } from "react";
import { CreditCard, Mail, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";

export default function GestorColaboradoresClient() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [colabName, setColabName] = useState("");
  const [colabEmail, setColabEmail] = useState("");

  function handleInvite() {
    if (!colabName.trim() || !colabEmail.trim()) {
      toast.error("Preenche todos os campos.");
      return;
    }
    toast.info("Convite ao colaborador: funcionalidade em integração com a API.");
    setInviteOpen(false);
    setColabName("");
    setColabEmail("");
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Colaboradores da Frota</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Gere os motoristas e colaboradores da tua frota. Envia convites de acesso por email.
            </div>
          </div>
          <Button
            onClick={() => setInviteOpen(true)}
            className="h-11 rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Colaborador
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar colaboradores..."
          className="h-11 rounded-2xl pl-10"
        />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">—</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Colaboradores Ativos</div>
        </div>
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Mail className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">—</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Convites Pendentes</div>
        </div>
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">—</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Cartões Atribuídos</div>
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <EmptyState
          icon={Users}
          title="Nenhum colaborador registado"
          description="Os colaboradores (motoristas) da tua frota aparecerão aqui. Envia convites por email para que acedam ao sistema com acesso simplificado."
          actionLabel="Convidar Colaborador"
          onAction={() => setInviteOpen(true)}
        />
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-extrabold text-zinc-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                <UserPlus className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              Convidar Colaborador
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-6 pt-5 pb-6">
            <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/40 px-4 py-3.5">
              <div className="flex items-center gap-5 text-xs font-semibold text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">1</span>
                  Recebe convite
                </span>
                <span className="text-emerald-300">→</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">2</span>
                  Cria conta
                </span>
                <span className="text-emerald-300">→</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">3</span>
                  Acesso activo
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-zinc-600">Nome do Colaborador</label>
              <Input
                value={colabName}
                onChange={(e) => setColabName(e.target.value)}
                placeholder="Nome completo"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-zinc-600">Email</label>
              <Input
                type="email"
                value={colabEmail}
                onChange={(e) => setColabEmail(e.target.value)}
                placeholder="colaborador@email.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => setInviteOpen(false)}
                className="h-11 flex-1 rounded-xl font-extrabold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInvite}
                className="h-11 flex-1 rounded-xl bg-emerald-600 font-extrabold hover:bg-emerald-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
