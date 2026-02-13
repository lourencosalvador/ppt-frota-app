"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Copy, CreditCard, Mail, Phone, RotateCcw, Search, ShieldBan, User, Users } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-client";
import { useCards } from "@/app/lib/api/cards-hooks";
import { useTickets } from "@/app/lib/api/tickets-hooks";
import { apiTicketToUi } from "@/app/(client)/meus-pedidos/lib/ticket-api-mapper";
import type { ApiCard } from "@/app/lib/api/cards";
import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";

type DerivedClient = {
  id: string;
  name: string;
  email: string;
  company: string;
  cards: Array<{
    id: string;
    masked: string;
    validThru: string;
    balanceKz: number;
    status: "ACTIVE" | "BLOCKED";
  }>;
  totalBalance: number;
};

function parseKz(v: string | undefined | null): number {
  if (!v) return 0;
  const cleaned = v.replace(/[^\d.,\-]/g, "").replace(",", ".");
  return Number(cleaned) || 0;
}

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function deriveClientsFromCards(cards: ApiCard[]): DerivedClient[] {
  const grouped = new Map<string, { cards: ApiCard[]; totalBalance: number }>();
  for (const card of cards) {
    const key = card.company ?? card.id;
    const balance = parseKz(card.current_balance);
    const existing = grouped.get(key);
    if (existing) {
      existing.cards.push(card);
      existing.totalBalance += balance;
    } else {
      grouped.set(key, { cards: [card], totalBalance: balance });
    }
  }

  return Array.from(grouped.entries()).map(([key, { cards: groupCards, totalBalance }]) => ({
    id: key,
    name: groupCards[0].company_name || "Cliente",
    email: "",
    company: groupCards[0].company_name || "Empresa",
    cards: groupCards.map((c) => ({
      id: c.id,
      masked: `**** **** **** ${c.uid?.slice(-4) ?? "0000"}`,
      validThru: c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-PT", { month: "2-digit", year: "2-digit" }) : "N/A",
      balanceKz: parseKz(c.current_balance),
      status: c.status === "active" ? "ACTIVE" as const : "BLOCKED" as const,
    })),
    totalBalance,
  }));
}

export default function SuporteConsultaClientesClient() {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  const lastErrorRef = useRef<string | null>(null);

  const cardsQuery = useCards();
  const ticketsQuery = useTickets({ page: 1, page_size: 50 });

  useEffect(() => {
    if (!cardsQuery.isError) return;
    const err = cardsQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar dados de clientes.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [cardsQuery.error, cardsQuery.isError]);

  const clients = useMemo<DerivedClient[]>(() => {
    if (!cardsQuery.data) return [];
    return deriveClientsFromCards(cardsQuery.data);
  }, [cardsQuery.data]);

  const recentTickets = useMemo<Ticket[]>(() => {
    const list = ticketsQuery.data ?? [];
    return list.map((t) => apiTicketToUi(t, "Cliente"));
  }, [ticketsQuery.data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((c) => {
      const blob = `${c.name} ${c.email} ${c.company}`.toLowerCase();
      return blob.includes(query);
    });
  }, [q, clients]);

  useEffect(() => {
    if (filtered.length === 0) return;
    if (filtered.some((c) => c.id === selectedId)) return;
    setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo<DerivedClient | null>(() => {
    return clients.find((c) => c.id === selectedId) ?? null;
  }, [selectedId, clients]);

  const isBlocked = selected ? Boolean(blocked[selected.id]) : false;
  const isActive = selected ? !isBlocked : false;

  return (
    <div className="mx-auto h-[calc(100dvh-128px)] w-full max-w-[1240px] overflow-hidden">
      <div className="grid h-full gap-6 lg:grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <div className="h-full overflow-hidden rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="text-sm font-extrabold text-zinc-900">Pesquisar Cliente</div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome ou Empresa..."
              className="h-11 rounded-xl pl-10"
            />
          </div>

          {cardsQuery.isLoading ? (
            <div className="mt-5 text-sm font-semibold text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                A carregar clientes...
              </span>
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            {filtered.map((c) => {
              const active = c.id === selectedId;
              const initial = c.name.trim().slice(0, 1).toUpperCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-transparent hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold",
                      active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600",
                    ].join(" ")}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-zinc-900">{c.name}</div>
                    <div className="truncate text-xs font-semibold text-zinc-400">{c.company}</div>
                  </div>
                </button>
              );
            })}

            {!cardsQuery.isLoading && filtered.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={Users}
                  title="Nenhum cliente encontrado"
                  description="Os clientes aparecerão aqui a partir dos dados de cartões da API."
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Detail */}
        <div className="h-full overflow-y-auto rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          {!selected ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
              <div className="text-sm font-semibold text-zinc-400">Selecione um cliente para ver detalhes.</div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xl font-extrabold text-zinc-900">{selected.name}</div>
                      <span
                        className={[
                          "inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest",
                          isActive
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700",
                        ].join(" ")}
                      >
                        {isActive ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-700 hover:bg-zinc-50"
                    onClick={() => toast.info("Reset de senha: integração com API em breve.")}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Senha
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={[
                      "h-10 rounded-xl font-extrabold",
                      isBlocked
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
                    ].join(" ")}
                    onClick={() => {
                      setBlocked((p) => ({ ...p, [selected.id]: !Boolean(p[selected.id]) }));
                      toast.message(isBlocked ? "Conta desbloqueada." : "Conta bloqueada.");
                    }}
                  >
                    <ShieldBan className="h-4 w-4" />
                    {isBlocked ? "Desbloquear Conta" : "Bloquear Conta"}
                  </Button>
                </div>
              </div>

              <div className="my-6 h-px bg-zinc-100" />

              {/* Info cards */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <Building2 className="h-4 w-4" /> Empresa
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">{selected.company}</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <CreditCard className="h-4 w-4" /> Cartões
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">{selected.cards.length} cartão(ões)</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <Mail className="h-4 w-4" /> Saldo Total
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">KZ {formatKz(selected.totalBalance)}</div>
                </div>
              </div>

              {/* Account card */}
              <div className="mt-6 overflow-hidden rounded-2xl bg-linear-to-br from-[#0B1220] via-[#101a2e] to-[#0B1220] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-white/70">
                      <CreditCard className="h-4 w-4 text-emerald-300" />
                      CONTA PRINCIPAL
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">
                      KZ {formatKz(selected.totalBalance)}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/60">{selected.company}</div>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 text-base font-extrabold text-zinc-900">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Cartões Associados
                </div>

                <div className="mt-3 space-y-3">
                  {selected.cards.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-[#0B1220] text-xs font-extrabold text-white">
                          F+
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-zinc-900">{c.masked}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">
                            Validade: {c.validThru}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-zinc-900">KZ {formatKz(c.balanceKz)}</div>
                        <span
                          className={[
                            "mt-1 inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest",
                            c.status === "ACTIVE"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 bg-zinc-100 text-zinc-700",
                          ].join(" ")}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {selected.cards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
                      <div className="text-sm font-semibold text-zinc-400">Sem cartões associados.</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Tickets */}
              <div className="mt-7">
                <div className="inline-flex items-center gap-2 text-base font-extrabold text-zinc-900">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  Histórico de Tickets Recentes
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50/60">
                        <TableHead className="w-[160px]">ID</TableHead>
                        <TableHead>ASSUNTO</TableHead>
                        <TableHead className="w-[160px]">STATUS</TableHead>
                        <TableHead className="w-[140px] text-right">DATA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTickets.slice(0, 10).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="py-4">
                            <div className="text-xs font-extrabold text-zinc-400">{t.code}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-semibold text-zinc-700">{t.subject}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <TicketStatusBadge status={t.status} />
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="text-sm font-semibold text-zinc-500">{t.createdAt}</div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {recentTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-12 text-center">
                            <div className="text-sm font-semibold text-zinc-400">Sem tickets recentes.</div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
