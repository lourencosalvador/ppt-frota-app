"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Copy, CreditCard, Mail, Phone, RotateCcw, Search, ShieldBan, User } from "lucide-react";
import { toast } from "sonner";

import { supportClientsMock, type SupportClient, type SupportTicketStatus } from "@/app/(suporte)/suporte/consulta-clientes/lib/mock-support-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function statusPill(status: SupportTicketStatus) {
  if (status === "ABERTO") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "APROVADO") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "ATRIBUÍDO") return "bg-zinc-100 text-zinc-700 border-zinc-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function SuporteConsultaClientesClient() {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string>(supportClientsMock[0]?.id ?? "");
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return supportClientsMock;
    return supportClientsMock.filter((c) => {
      const blob = `${c.name} ${c.email} ${c.company} ${c.phone} ${c.nif}`.toLowerCase();
      return blob.includes(query);
    });
  }, [q]);

  useEffect(() => {
    if (filtered.length === 0) return;
    if (filtered.some((c) => c.id === selectedId)) return;
    setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo<SupportClient | null>(() => {
    return supportClientsMock.find((c) => c.id === selectedId) ?? null;
  }, [selectedId]);

  const isBlocked = selected ? Boolean(blocked[selected.id]) : false;
  const isActive = selected ? selected.isActive && !isBlocked : false;

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
              placeholder="Nome, Email ou NIF..."
              className="h-11 rounded-xl pl-10"
            />
          </div>

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
                    <div className="truncate text-xs font-semibold text-zinc-400">{c.email}</div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
                <div className="text-sm font-semibold text-zinc-400">Nenhum cliente encontrado.</div>
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
                      <div className="text-xs font-semibold text-zinc-400">Cliente desde {selected.sinceYear}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-700 hover:bg-zinc-50"
                    onClick={() => toast.success("Reset de senha enviado (mock).")}
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
                    <Mail className="h-4 w-4" /> Email
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">{selected.email}</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <Phone className="h-4 w-4" /> Telefone
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">{selected.phone}</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <Building2 className="h-4 w-4" /> Empresa / NIF
                  </div>
                  <div className="mt-2 truncate text-sm font-extrabold text-zinc-900">{selected.company}</div>
                  <div className="mt-1 text-xs font-semibold text-zinc-400">{selected.nif}</div>
                </div>
              </div>

              {/* Account card */}
              <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1220] via-[#101a2e] to-[#0B1220] p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-white/70">
                      <CreditCard className="h-4 w-4 text-emerald-300" />
                      {selected.account.label}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">
                      KZ {formatKz(selected.account.balanceKz)}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/60">{selected.company}</div>
                  </div>

                  <div className="min-w-[240px]">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/60">
                      IBAN para Carregamento
                    </div>
                    <div className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3">
                      <div className="truncate text-sm font-extrabold text-white/90">{selected.account.iban}</div>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/15"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.account.iban);
                            toast.success("IBAN copiado.");
                          } catch {
                            toast.error("Não foi possível copiar.");
                          }
                        }}
                        aria-label="Copiar IBAN"
                        title="Copiar"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
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
                      {selected.recentTickets.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="py-4">
                            <div className="text-xs font-extrabold text-zinc-400">{t.id}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-semibold text-zinc-700">{t.subject}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusPill(t.status)}`}
                            >
                              {t.status}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="text-sm font-semibold text-zinc-500">{t.date}</div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {selected.recentTickets.length === 0 ? (
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

