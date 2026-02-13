"use client";

import { useState } from "react";
import { Mail, Search, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/ui/empty-state";

type UserRole = "admin" | "support" | "gestor";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador Pumangol",
  support: "Suporte Técnico",
  gestor: "Gestor da Frota",
};

export default function AdminUtilizadoresClient() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("gestor");

  function handleCreate() {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Preenche todos os campos.");
      return;
    }
    toast.info(`Criação de utilizador (${roleLabels[userRole]}): funcionalidade em integração com a API.`);
    setCreateOpen(false);
    setUserName("");
    setUserEmail("");
    setUserRole("gestor");
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Gestão de Utilizadores</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">Cria e gere administradores, suporte técnico e gestores de frota.</div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="h-11 rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700"><UserPlus className="mr-2 h-4 w-4" />Novo Utilizador</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar utilizadores..." className="h-11 rounded-2xl pl-10" />
      </div>

      <div className="flex flex-wrap gap-3">
        {(["admin", "support", "gestor"] as const).map((role) => (
          <div key={role} className="rounded-xl border border-zinc-100/60 bg-white px-4 py-3 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{roleLabels[role]}</div>
            <div className="mt-1 text-lg font-extrabold text-zinc-900">—</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <EmptyState icon={Users} title="Nenhum utilizador encontrado" description="Os utilizadores do sistema (administradores, suporte técnico e gestores) aparecem aqui." actionLabel="Novo Utilizador" onAction={() => setCreateOpen(true)} />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-zinc-900"><UserPlus className="h-5 w-5 text-emerald-600" />Novo Utilizador</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nome Completo</label>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nome do utilizador" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Email</label>
              <Input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="email@pumangol.co.ao" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Perfil / Função</label>
              <Select value={userRole} onValueChange={(v) => setUserRole(v as UserRole)}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador Pumangol</SelectItem>
                  <SelectItem value="support">Suporte Técnico</SelectItem>
                  <SelectItem value="gestor">Gestor da Frota</SelectItem>
                </SelectContent>
              </Select>
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
