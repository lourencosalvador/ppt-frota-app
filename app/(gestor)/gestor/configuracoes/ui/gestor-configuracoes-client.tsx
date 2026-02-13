"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Barcode, Building2, CreditCard, Landmark, Pencil, Plus, Settings, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ApiStation } from "@/app/lib/api/stations";
import { ApiError } from "@/app/lib/api/api-client";
import { useCreateStation, useStations } from "@/app/lib/api/stations-hooks";
import type { PaymentMethod } from "@/app/(gestor)/gestor/configuracoes/lib/mock-config";
import StationModal from "@/app/(gestor)/gestor/configuracoes/components/station-modal";
import EmptyState from "@/components/ui/empty-state";
import ProfileSettings from "@/components/profile-settings";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const defaultPaymentMethods: PaymentMethod[] = [
  { id: "pm1", name: "Referência Multibanco", description: "Pagamento via entidade e referência.", active: true },
  { id: "pm2", name: "Transferência Bancária (IBAN)", description: "Validação manual mediante comprovativo.", active: true },
  { id: "pm3", name: "Débito Direto (SEPA)", description: "Cobrança automática mensal.", active: false },
  { id: "pm4", name: "Cheque Bancário", description: "Apenas presencial na sede.", active: false },
];

type SectionKey = "POSTOS" | "METODOS" | "NOTIFICACOES" | "PERFIS";

function statusPill(active: boolean) {
  if (active) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-red-50 text-red-700 border-red-100";
}

function sectionButton(active: boolean) {
  return active
    ? "bg-emerald-50 text-emerald-800"
    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800";
}

function methodCard(active: boolean) {
  return active
    ? "border-emerald-200 bg-white shadow-[0_8px_26px_rgba(16,185,129,0.08)]"
    : "border-zinc-100 bg-zinc-50/50";
}

function methodIcon(active: boolean) {
  return active
    ? "bg-emerald-50 text-emerald-700"
    : "bg-zinc-100 text-zinc-500";
}

function methodStatusPill(active: boolean) {
  return active ? "text-emerald-700" : "text-zinc-400";
}

function switchTrack(active: boolean) {
  return active ? "bg-emerald-600" : "bg-zinc-200";
}

function switchThumb(active: boolean) {
  return active ? "translate-x-5" : "translate-x-0";
}

function iconForMethod(name: string) {
  const n = name.toLowerCase();
  if (n.includes("multibanco")) return Barcode;
  if (n.includes("transfer")) return Landmark;
  if (n.includes("sepa")) return TicketPercent;
  return Banknote;
}

export default function GestorConfiguracoesClient() {
  const [section, setSection] = useState<SectionKey>("POSTOS");
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiStation | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  const stationsQuery = useStations({ include_inactive: true });
  const createStation = useCreateStation();

  useEffect(() => {
    if (!stationsQuery.isError) return;
    const err = stationsQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar postos.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [stationsQuery.error, stationsQuery.isError]);

  const title = useMemo(() => {
    if (section === "POSTOS") return { t: "Gestão de Postos Parceiros", s: "Adicione ou remova postos da rede autorizada." };
    if (section === "METODOS") return { t: "Métodos de Carregamento", s: "Controle quais opções de pagamento estão disponíveis para os clientes carregarem suas contas." };
    if (section === "NOTIFICACOES") return { t: "Notificações", s: "Preferências de comunicação (em breve)." };
    return { t: "Meu Perfil", s: "Atualiza o teu nome, email, senha e foto de perfil." };
  }, [section]);

  return (
    <div className="w-full">
      <StationModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onCreate={async (body) => {
          const created = await createStation.mutateAsync(body);
          return created;
        }}
      />

      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="text-sm font-extrabold text-zinc-900">Configurações</div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setSection("POSTOS")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold ${sectionButton(section === "POSTOS")}`}
              >
                <Building2 className={`h-4 w-4 ${section === "POSTOS" ? "text-emerald-600" : "text-zinc-400"}`} />
                Gestão de Postos
              </button>
              <button
                type="button"
                onClick={() => setSection("METODOS")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold ${sectionButton(section === "METODOS")}`}
              >
                <CreditCard className={`h-4 w-4 ${section === "METODOS" ? "text-emerald-600" : "text-zinc-400"}`} />
                Métodos de Carga
              </button>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold text-zinc-300"
              >
                <Settings className="h-4 w-4 text-zinc-200" />
                Notificações
              </button>
              <button
                type="button"
                onClick={() => setSection("PERFIS")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold ${sectionButton(section === "PERFIS")}`}
              >
                <Settings className={`h-4 w-4 ${section === "PERFIS" ? "text-emerald-600" : "text-zinc-400"}`} />
                Meu Perfil
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-lg font-extrabold text-zinc-900">{title.t}</div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">{title.s}</div>
              </div>

              {section === "POSTOS" ? (
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-emerald-600 px-5 font-extrabold hover:bg-emerald-700"
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Posto
                </Button>
              ) : null}
            </div>

            {section === "POSTOS" ? (
              <div className="overflow-hidden">
                {stationsQuery.isLoading ? (
                  <div className="px-6 py-6 text-sm font-semibold text-zinc-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                      A carregar postos...
                    </span>
                  </div>
                ) : null}

                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50">
                      <TableHead>NOME DO POSTO</TableHead>
                      <TableHead>LOCALIZAÇÃO</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stationsQuery.data ?? []).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="py-5">
                          <div className="text-sm font-extrabold text-zinc-900">{s.name}</div>
                          <div className="mt-0.5 text-xs font-semibold text-zinc-400">{s.address}</div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="text-sm font-semibold text-zinc-600">{s.city}</div>
                          <div className="text-xs font-semibold text-zinc-400">{s.province}</div>
                        </TableCell>
                        <TableCell className="py-5">
                          <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-extrabold ${statusPill(s.is_active)}`}>
                            {s.is_active ? "Ativo" : "Indisponível"}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(s);
                                setModalOpen(true);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toast.info("Remover posto: endpoint ainda não disponível.");
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                              aria-label="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!stationsQuery.isLoading && (stationsQuery.data?.length ?? 0) === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8">
                          <EmptyState
                            icon={Building2}
                            title="Nenhum posto encontrado"
                            description="Os postos parceiros vão aparecer aqui quando forem criados."
                            actionLabel="Novo Posto"
                            onAction={() => { setEditing(null); setModalOpen(true); }}
                          />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            ) : section === "METODOS" ? (
              <div className="px-6 py-6">
                <div className="grid gap-4">
                  {methods.map((m) => {
                    const Icon = iconForMethod(m.name);
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between rounded-2xl border px-6 py-5 ${methodCard(m.active)}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${methodIcon(m.active)}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className={`text-sm font-extrabold ${m.active ? "text-zinc-900" : "text-zinc-400"}`}>
                              {m.name}
                            </div>
                            <div className={`mt-1 text-xs font-semibold ${m.active ? "text-zinc-500" : "text-zinc-300"}`}>
                              {m.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`text-xs font-extrabold uppercase tracking-widest ${methodStatusPill(m.active)}`}>
                            {m.active ? "ATIVADO" : "DESATIVADO"}
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={m.active}
                            onClick={() => {
                              setMethods((prev) =>
                                prev.map((p) => (p.id === m.id ? { ...p, active: !p.active } : p)),
                              );
                              toast.success(m.active ? "Método desativado." : "Método ativado.");
                            }}
                            className={[
                              "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
                              switchTrack(m.active),
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
                                "translate-x-1",
                                switchThumb(m.active),
                              ].join(" ")}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : section === "PERFIS" ? (
              <div className="px-6 py-6">
                <ProfileSettings />
              </div>
            ) : (
              <div className="px-6 py-16 text-center text-sm font-semibold text-zinc-400">
                Em breve.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

