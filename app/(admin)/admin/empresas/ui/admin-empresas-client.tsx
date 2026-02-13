"use client";

import { useState } from "react";
import { Building2, Mail, Plus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";

export default function AdminEmpresasClient() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gestorName, setGestorName] = useState("");
  const [gestorEmail, setGestorEmail] = useState("");

  function handleCreate() {
    if (!companyName.trim() || !gestorName.trim() || !gestorEmail.trim()) {
      toast.error("Preenche todos os campos.");
      return;
    }
    toast.info("Criação de empresa + convite ao gestor: funcionalidade em integração com a API.");
    setCreateOpen(false);
    setCompanyName("");
    setGestorName("");
    setGestorEmail("");
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Empresas / Frotas</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">Regista e gere as empresas aderentes ao sistema Frota+.</div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="h-11 rounded-2xl bg-[#0B1220] px-6 hover:bg-[#0E2236]"><Plus className="mr-2 h-4 w-4" />Nova Empresa</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar empresas..." className="h-11 rounded-2xl pl-10" />
      </div>

      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <EmptyState icon={Building2} title="Nenhuma empresa registada" description="As empresas/frotas criadas pelo administrador vão aparecer aqui. Utiliza o processo de onboarding para registar uma nova empresa e convidar o seu gestor." actionLabel="Nova Empresa" onAction={() => setCreateOpen(true)} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-zinc-900"><Building2 className="h-5 w-5 text-blue-600" />Onboarding — Nova Empresa</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="text-xs font-bold text-blue-800">Processo de Adesão</div>
              <ol className="mt-2 space-y-1 text-xs font-semibold text-blue-700">
                <li>1. Preenche os dados da empresa e do gestor</li>
                <li>2. O sistema envia um convite por email ao gestor</li>
                <li>3. O gestor aceita e acede ao sistema</li>
              </ol>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nome da Empresa / Frota</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Transportes Angola Lda." className="h-11 rounded-xl" />
            </div>
            <div className="border-t border-zinc-100 pt-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-zinc-700"><UserPlus className="h-4 w-4 text-emerald-600" />Gestor da Frota</div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nome do Gestor</label>
                  <Input value={gestorName} onChange={(e) => setGestorName(e.target.value)} placeholder="Nome completo" className="h-11 rounded-xl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-600">Email do Gestor</label>
                  <Input type="email" value={gestorEmail} onChange={(e) => setGestorEmail(e.target.value)} placeholder="gestor@empresa.com" className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-10 rounded-xl">Cancelar</Button>
              <Button onClick={handleCreate} className="h-10 rounded-xl bg-emerald-600 px-6 hover:bg-emerald-700"><Mail className="mr-2 h-4 w-4" />Criar & Enviar Convite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
