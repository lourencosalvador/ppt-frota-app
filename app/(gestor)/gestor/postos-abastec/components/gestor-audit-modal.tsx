"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import type { ManualFuelRecord, ManualFuelStatus } from "@/app/(client)/postos-parceiros/lib/mock-history";
import type { GestorStation } from "@/app/(gestor)/gestor/postos-abastec/lib/mock-gestor-stations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TabKey = "TODOS" | "PENDENTES" | "REGULARIZADOS";

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function statusLabel(status: ManualFuelStatus) {
  if (status === "EM REGULARIZAÇÃO") return "REGULARIZADO";
  return status;
}

function statusBadge(status: ManualFuelStatus) {
  switch (status) {
    case "ABERTO":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "APROVADO":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "EM REGULARIZAÇÃO":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
}

function tabButton(active: boolean) {
  return active
    ? "bg-[#0B1220] text-white border-[#0B1220]"
    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50";
}

function parseYearFromDate(date: string) {
  // suporta "21/05/2024" e "5/21/2024"
  const parts = date.split("/");
  const year = parts[2];
  const y = year ? Number(year) : NaN;
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

function auditCodeFor(record: ManualFuelRecord, idx: number) {
  const year = parseYearFromDate(record.date);
  const num = 400 + idx + 1;
  return `TKT-${year}-${String(num).padStart(3, "0")}`;
}

export default function GestorAuditModal({
  open,
  onOpenChange,
  station,
  records,
  onUpdateStatus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  station: GestorStation | null;
  records: ManualFuelRecord[];
  onUpdateStatus: (args: { stationId: string; recordId: string; status: ManualFuelStatus }) => void;
}) {
  const [tab, setTab] = useState<TabKey>("TODOS");

  useEffect(() => {
    if (!open) return;
    setTab("TODOS");
  }, [open, station?.id]);

  const filtered = useMemo(() => {
    if (tab === "TODOS") return records;
    if (tab === "PENDENTES") return records.filter((r) => r.status === "ABERTO");
    return records.filter((r) => r.status !== "ABERTO");
  }, [records, tab]);

  const stats = useMemo(() => {
    const totalKz = records.reduce((acc, r) => acc + r.amountKz, 0);
    const totalLiters = records.reduce((acc, r) => acc + r.liters, 0);
    const pending = records.filter((r) => r.status === "ABERTO").length;
    const regularized = Math.max(0, records.length - pending);
    const risk = Math.min(0.8, pending * 0.2); // 0.2% por pendência (mock)
    return { totalKz, totalLiters, pending, regularized, risk, count: records.length };
  }, [records]);

  function approve(r: ManualFuelRecord) {
    if (!station?.id) return;
    onUpdateStatus({ stationId: station.id, recordId: r.id, status: "APROVADO" });
    toast.success("Registo aprovado.");
  }

  function reject(r: ManualFuelRecord) {
    if (!station?.id) return;
    onUpdateStatus({ stationId: station.id, recordId: r.id, status: "EM REGULARIZAÇÃO" });
    toast.message("Registo marcado como regularizado.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[980px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:left-[calc(50%+132px)]">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {station?.name ? `Auditoria - ${station.name}` : "Módulo de Auditoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[90vh] flex-col">
          <div className="bg-[#0B1220] px-6 py-6 text-white">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-extrabold uppercase">
                    {station?.name?.toUpperCase() ?? "POSTO"}
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-zinc-200/80">
                    INTERFACE DE AUDITORIA INSTITUCIONAL E CONTROLO DE FRAUDE
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50/60 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Volume acumulado
                </div>
                <div className="mt-1 text-3xl font-extrabold text-zinc-900">
                  {stats.totalLiters.toFixed(1)} <span className="text-base font-extrabold text-zinc-400">L</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Impacto financeiro
                </div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-700">
                  Kz{formatKz(stats.totalKz)}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Risco de anomalia
                </div>
                <div className="mt-1 text-3xl font-extrabold text-blue-600">
                  {stats.risk.toFixed(1)}%
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success("Auditoria certificada.")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B1220] px-6 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-[#101a2e]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                Auditoria Certificada
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setTab("TODOS")}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "TODOS")}`}
              >
                TODOS ({stats.count})
              </button>
              <button
                type="button"
                onClick={() => setTab("PENDENTES")}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "PENDENTES")}`}
              >
                PENDENTES ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setTab("REGULARIZADOS")}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "REGULARIZADOS")}`}
              >
                REGULARIZADOS ({stats.regularized})
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-100/60 bg-white">
              {/* Mantém colunas estáveis (sem esmagar/overlap) em ecrãs menores */}
              <div className="overflow-x-auto">
                <div className="min-w-[1180px]">
                  <div className="grid grid-cols-[180px_minmax(0,1.2fr)_180px_200px_160px_140px] gap-4 bg-zinc-50/60 px-5 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    <div>ID AUDITORIA</div>
                    <div>ENTIDADE</div>
                    <div>VIATURA</div>
                    <div>FINANCEIRO</div>
                    <div>ESTADO</div>
                    <div className="text-right">ACÇÕES</div>
                  </div>

                  <div className="space-y-4 bg-white p-4">
                    {filtered.map((r, idx) => {
                      const code = auditCodeFor(r, idx);
                      const showActions = r.status === "ABERTO";
                      return (
                        <div
                          key={r.id}
                          className="grid grid-cols-[180px_minmax(0,1.2fr)_180px_200px_160px_140px] items-center gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_2px_18px_rgb(0,0,0,0.03)]"
                        >
                      <div>
                        <div className="text-sm font-extrabold text-zinc-800">{code}</div>
                        <div className="text-sm font-bold text-zinc-500">{r.date}</div>
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <div className="truncate text-sm font-extrabold text-zinc-800">
                          {r.requester}
                        </div>
                        <div className="truncate whitespace-nowrap text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                          FROTA PARCEIRA
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-zinc-700">
                          {r.vehicle}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-zinc-800">Kz {formatKz(r.amountKz)}</div>
                        <div className="text-xs font-semibold text-zinc-400">
                          {r.liters} LITROS
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest ${statusBadge(r.status)}`}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {showActions ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approve(r)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Aprovar"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reject(r)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700"
                              title="Rejeitar"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => toast.message("Detalhes do registo (em breve).")}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                          title="Ver"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                        </div>
                      );
                    })}

                    {filtered.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
                        <div className="text-sm font-semibold text-zinc-400">Nenhum registo encontrado.</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] px-6 py-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                PUMANGOL GOVERNANCE
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-200/80">
                RASTREABILIDADE INSTITUCIONAL ATIVA
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-zinc-100">
                OPERADOR: CARLOS GESTOR
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

