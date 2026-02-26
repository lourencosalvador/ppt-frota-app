"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  CreditCard,
  Search,
  User,
  Users,
} from "lucide-react";

import { MOCK_FLEETS, type Fleet, type FleetCard, type FleetUser } from "../lib/mock-support-clients";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

type Tab = "utilizadores" | "cartoes";

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function cardStatusStyle(s: FleetCard["status"]) {
  if (s === "ACTIVE") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (s === "BLOCKED") return "border-red-100 bg-red-50 text-red-600";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function cardStatusLabel(s: FleetCard["status"]) {
  if (s === "ACTIVE") return "Activo";
  if (s === "BLOCKED") return "Bloqueado";
  return "Suspenso";
}

function UsersTab({ users }: { users: FleetUser[] }) {
  if (users.length === 0)
    return (
      <EmptyState
        icon={Users}
        title="Sem utilizadores"
        description="Nenhum utilizador registado nesta frota."
      />
    );

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-extrabold text-zinc-600">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-zinc-900">{u.name}</div>
              <div className="text-xs font-semibold text-zinc-400">{u.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-600">
                {u.role}
              </span>
            </div>
            <div>
              {u.cardId ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cartão atribuído
                </span>
              ) : (
                <span className="text-xs font-semibold text-zinc-400">Sem cartão</span>
              )}
            </div>
            <div>
              <span
                className={`inline-flex h-2 w-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-zinc-300"}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsTab({ cards }: { cards: FleetCard[] }) {
  if (cards.length === 0)
    return (
      <EmptyState
        icon={CreditCard}
        title="Sem cartões"
        description="Nenhum cartão registado nesta frota."
      />
    );

  return (
    <div className="space-y-2">
      {cards.map((c) => (
        <div
          key={c.id}
          className="rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-[#0B1220] text-xs font-extrabold text-white">
                F+
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-zinc-900">{c.masked}</div>
                <div className="mt-0.5 text-xs font-semibold text-zinc-400">
                  Validade: {c.validThru}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-xs font-semibold text-zinc-400">Saldo</div>
                <div className="text-sm font-extrabold text-zinc-900">
                  KZ {formatKz(c.balanceKz)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-zinc-400">Limite</div>
                <div className="text-sm font-extrabold text-zinc-900">
                  KZ {formatKz(c.limitKz)}
                </div>
              </div>
              <span
                className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${cardStatusStyle(c.status)}`}
              >
                {cardStatusLabel(c.status)}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-zinc-50 pt-3">
            <User className="h-3.5 w-3.5 text-zinc-400" />
            {c.assignedTo ? (
              <span className="text-xs font-semibold text-zinc-600">
                Atribuído a <span className="font-extrabold text-zinc-900">{c.assignedTo}</span>
                {c.assignedRole ? (
                  <span className="ml-1.5 text-zinc-400">({c.assignedRole})</span>
                ) : null}
              </span>
            ) : (
              <span className="text-xs font-semibold text-zinc-400">Não atribuído</span>
            )}
            {c.lastUsed ? (
              <span className="ml-auto text-[11px] font-semibold text-zinc-400">
                Último uso: {new Date(c.lastUsed).toLocaleDateString("pt-PT")}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SuporteConsultaClientesClient() {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string>(MOCK_FLEETS[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("utilizadores");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK_FLEETS;
    return MOCK_FLEETS.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.nif.includes(query) ||
        f.sector.toLowerCase().includes(query),
    );
  }, [q]);

  const selected = useMemo<Fleet | null>(
    () => MOCK_FLEETS.find((f) => f.id === selectedId) ?? null,
    [selectedId],
  );

  return (
    <div className="mx-auto h-[calc(100dvh-128px)] w-full max-w-[1240px] overflow-hidden">
      <div className="grid h-full gap-6 lg:grid-cols-[340px_1fr]">
        {/* Fleet list */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="border-b border-zinc-100 px-5 pt-5 pb-4">
            <div className="text-sm font-extrabold uppercase tracking-widest text-zinc-900">
              Frotas
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar empresa..."
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {filtered.map((f) => {
                const active = f.id === selectedId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(f.id);
                      setTab("utilizadores");
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition",
                      active
                        ? "border-emerald-100 bg-emerald-50/60"
                        : "border-transparent hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold",
                        active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600",
                      ].join(" ")}
                    >
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-zinc-900">
                        {f.name}
                      </div>
                      <div className="truncate text-xs font-semibold text-zinc-400">
                        NIF: {f.nif}
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${active ? "text-emerald-600" : "text-zinc-300"}`}
                    />
                  </button>
                );
              })}

              {filtered.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={Building2}
                    title="Nenhuma empresa encontrada"
                    description="Ajuste a pesquisa para encontrar frotas."
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="text-center">
                <Building2 className="mx-auto h-10 w-10 text-zinc-200" />
                <div className="mt-3 text-sm font-semibold text-zinc-400">
                  Selecione uma empresa para ver detalhes.
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-zinc-100 px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-extrabold text-zinc-600">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-extrabold text-zinc-900">
                          {selected.name}
                        </div>
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${
                            selected.isActive
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {selected.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-zinc-400">
                        NIF: {selected.nif} · {selected.sector}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-extrabold text-zinc-700">
                      {selected.totalUsers} utilizador{selected.totalUsers !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-extrabold text-zinc-700">
                      {selected.activeCards}/{selected.totalCards} cartões activos
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-100 px-6">
                <button
                  type="button"
                  onClick={() => setTab("utilizadores")}
                  className={[
                    "relative px-4 py-3.5 text-sm font-extrabold transition",
                    tab === "utilizadores"
                      ? "text-emerald-700"
                      : "text-zinc-400 hover:text-zinc-600",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Utilizadores
                  </span>
                  {tab === "utilizadores" ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-emerald-600" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("cartoes")}
                  className={[
                    "relative px-4 py-3.5 text-sm font-extrabold transition",
                    tab === "cartoes"
                      ? "text-emerald-700"
                      : "text-zinc-400 hover:text-zinc-600",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartões
                  </span>
                  {tab === "cartoes" ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-emerald-600" />
                  ) : null}
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">
                {tab === "utilizadores" ? (
                  <UsersTab users={selected.users} />
                ) : (
                  <CardsTab cards={selected.cards} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
