"use client";

import { useState } from "react";
import { Building2, Mail, Search, ShieldCheck, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/ui/empty-state";

type UserRole = "admin" | "support" | "gestor" | "colaborador";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador Pumangol",
  support: "Suporte Técnico",
  gestor: "Gestor da Frota",
  colaborador: "Colaborador (Motorista)",
};

const roleDescriptions: Record<UserRole, string> = {
  admin: "Acesso total ao sistema. Gere empresas, utilizadores e configurações.",
  support: "Atende tickets de suporte e monitoriza o sistema.",
  gestor: "Gere a frota atribuída: cartões, movimentos e colaboradores.",
  colaborador: "Acesso simplificado: visualiza saldo e transações do seu cartão.",
};

const needsFleet = (role: UserRole) => role === "gestor" || role === "colaborador";

const mockFlotas = [
  { id: "f1", name: "Transportes Angola Lda." },
  { id: "f2", name: "Logística Luanda SARL" },
  { id: "f3", name: "Distribuidora Sul" },
];

export default function AdminUtilizadoresClient() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("gestor");
  const [userFlota, setUserFlota] = useState("");

  function resetForm() {
    setUserName("");
    setUserEmail("");
    setUserRole("gestor");
    setUserFlota("");
  }

  function handleCreate() {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Preenche o nome e email.");
      return;
    }
    if (needsFleet(userRole) && !userFlota) {
      toast.error("Seleciona a frota para este utilizador.");
      return;
    }
    const fleetLabel = needsFleet(userRole)
      ? ` na frota "${mockFlotas.find((f) => f.id === userFlota)?.name}"`
      : "";
    toast.info(`Criação de ${roleLabels[userRole]}${fleetLabel}: funcionalidade em integração com a API.`);
    setCreateOpen(false);
    resetForm();
  }

  const kpis: { role: UserRole; icon: typeof ShieldCheck; bg: string; fg: string }[] = [
    { role: "admin", icon: ShieldCheck, bg: "bg-violet-50", fg: "text-violet-700" },
    { role: "support", icon: Users, bg: "bg-blue-50", fg: "text-blue-700" },
    { role: "gestor", icon: Building2, bg: "bg-emerald-50", fg: "text-emerald-700" },
    { role: "colaborador", icon: UserPlus, bg: "bg-amber-50", fg: "text-amber-700" },
  ];

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Gestão de Utilizadores</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Cria e gere todos os utilizadores do sistema: administradores, suporte, gestores e colaboradores.
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Utilizador
          </Button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar utilizadores..."
            className="h-11 rounded-2xl pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={(v) => setFilterRole(v as UserRole | "all")}>
          <SelectTrigger className="h-11 w-52 rounded-2xl">
            <SelectValue placeholder="Filtrar por perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="support">Suporte Técnico</SelectItem>
            <SelectItem value="gestor">Gestor da Frota</SelectItem>
            <SelectItem value="colaborador">Colaborador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.role}
            className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg} ${k.fg}`}>
              <k.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-2xl font-extrabold text-zinc-900">—</div>
            <div className="mt-1 text-xs font-semibold text-zinc-500">{roleLabels[k.role]}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <EmptyState
          icon={Users}
          title="Nenhum utilizador encontrado"
          description="Todos os utilizadores criados pelo administrador aparecem aqui. Utiliza o botão acima para adicionar um novo utilizador e enviar o convite de acesso."
          actionLabel="Novo Utilizador"
          onAction={() => setCreateOpen(true)}
        />
      </div>

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-zinc-900">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Novo Utilizador
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            {/* Role selector */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Perfil / Função</label>
              <Select
                value={userRole}
                onValueChange={(v) => {
                  setUserRole(v as UserRole);
                  if (!needsFleet(v as UserRole)) setUserFlota("");
                }}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador Pumangol</SelectItem>
                  <SelectItem value="support">Suporte Técnico</SelectItem>
                  <SelectItem value="gestor">Gestor da Frota</SelectItem>
                  <SelectItem value="colaborador">Colaborador (Motorista)</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-1.5 text-[11px] font-semibold text-zinc-400">
                {roleDescriptions[userRole]}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nome Completo</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nome do utilizador"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-600">Email</label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@pumangol.co.ao"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Fleet assignment — only for gestor / colaborador */}
            {needsFleet(userRole) && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-blue-800">
                  <Building2 className="h-4 w-4" />
                  Atribuição de Frota
                </div>
                <div className="text-[11px] font-semibold text-blue-700">
                  {userRole === "gestor"
                    ? "O gestor ficará responsável pela frota selecionada."
                    : "O colaborador será adicionado à frota selecionada."}
                </div>
                <div className="mt-3">
                  <Select value={userFlota} onValueChange={setUserFlota}>
                    <SelectTrigger className="h-11 rounded-xl border-blue-200 bg-white">
                      <SelectValue placeholder="Seleciona a frota" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFlotas.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-10 rounded-xl">
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="h-10 rounded-xl bg-emerald-600 px-6 hover:bg-emerald-700">
                <Mail className="mr-2 h-4 w-4" />
                Criar & Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
