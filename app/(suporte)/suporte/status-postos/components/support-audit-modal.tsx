"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, History, Play, ShieldCheck, Zap, X } from "lucide-react";
import { toast } from "sonner";

import type { ManualFuelRecord, ManualFuelStatus } from "@/app/(client)/postos-parceiros/lib/mock-history";
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
    : "bg-white text-zinc-500 border-transparent hover:text-zinc-700";
}

function formatDateDisplay(date: string) {
  // aceita "YYYY-MM-DD" e "M/D/YYYY" (mantém se já tiver /)
  if (date.includes("/")) return date;
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return date;
  const [, y, mm, dd] = m;
  return `${Number(mm)}/${Number(dd)}/${y}`;
}

function parseYearFromDate(date: string) {
  const parts = date.split("/");
  const year = parts[2];
  const y = year ? Number(year) : NaN;
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

function auditCodeFor(record: ManualFuelRecord, idx: number) {
  const year = parseYearFromDate(formatDateDisplay(record.date));
  const num = 134 + idx;
  return `TKT-${year}-${String(num).padStart(3, "0")}`;
}

export default function SupportAuditModal({
  open,
  onOpenChange,
  stationName,
  records,
  operatorLabel = "ANA SUPORTE",
  onUpdateStatus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stationName: string | null;
  records: ManualFuelRecord[];
  operatorLabel?: string;
  onUpdateStatus: (args: { recordId: string; status: ManualFuelStatus }) => void;
}) {
  const [tab, setTab] = useState<TabKey>("TODOS");

  useEffect(() => {
    if (!open) return;
    setTab("TODOS");
  }, [open, stationName]);

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
    return { totalKz, totalLiters, pending, regularized, count: records.length };
  }, [records]);

  const dataState =
    stats.pending === 0
      ? { label: "DADOS REGULARIZADOS", cls: "text-emerald-700 border-emerald-100 bg-emerald-50/70", iconCls: "text-emerald-600" }
      : { label: "DADOS PENDENTES", cls: "text-blue-700 border-blue-100 bg-blue-50/70", iconCls: "text-blue-600" };

  function justificar(r: ManualFuelRecord) {
    onUpdateStatus({ recordId: r.id, status: "EM REGULARIZAÇÃO" });
    toast.message("Registo regularizado.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1120px] overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(0,0,0,0.35)] [&_[data-dialog-close]]:hidden lg:left-[calc(50%+132px)]">
        <DialogHeader className="sr-only">
          <DialogTitle>{stationName ? `Abastecimentos - ${stationName}` : "Gestão de Abastecimentos"}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[92vh] flex-col">
          {/* Header branco */}
          <div className="bg-white px-8 pt-7">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                  <History className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold uppercase text-zinc-900">
                    {stationName?.toUpperCase() ?? "POSTO"}
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                    GESTÃO DE ABASTECIMENTOS EXCECIONAIS
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Top stats */}
          <div className="mt-5 bg-zinc-50/70 px-8 py-6">
            <div className="grid gap-5 lg:grid-cols-[260px_260px_1fr] lg:items-center">
              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Volume acumulado
                </div>
                <div className="mt-1 text-3xl font-extrabold text-zinc-900">
                  {stats.totalLiters.toFixed(1)}{" "}
                  <span className="text-base font-extrabold text-zinc-400">L</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Impacto financeiro
                </div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-700">
                  Kz{formatKz(stats.totalKz)}
                </div>
              </div>

              <div className="flex lg:justify-end">
                <div className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-4 ${dataState.cls}`}>
                  <CheckCircle2 className={`h-6 w-6 ${dataState.iconCls}`} />
                  <div className="leading-tight">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest opacity-75">Estado</div>
                    <div className="text-xs font-extrabold uppercase tracking-widest">{dataState.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + table */}
          <div className="flex-1 overflow-auto bg-white px-8 py-6">
            <div className="flex flex-wrap items-center gap-6 border-b border-zinc-100 pb-4">
              <button
                type="button"
                onClick={() => setTab("TODOS")}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tabButton(tab === "TODOS")}`}
              >
                TODOS ({stats.count})
              </button>
              <button
                type="button"
                onClick={() => setTab("PENDENTES")}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tabButton(tab === "PENDENTES")}`}
              >
                PENDENTES ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setTab("REGULARIZADOS")}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tabButton(tab === "REGULARIZADOS")}`}
              >
                REGULARIZADOS ({stats.regularized})
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-100 bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[1040px]">
                  <div className="grid grid-cols-[180px_minmax(0,1.2fr)_170px_190px_150px_220px] gap-4 bg-zinc-50/60 px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
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
                      const showJustificar = r.status === "ABERTO";
                      return (
                        <div
                          key={r.id}
                          className="grid grid-cols-[180px_minmax(0,1.2fr)_170px_190px_150px_220px] items-center gap-4 rounded-2xl border border-zinc-100 bg-white px-6 py-4 shadow-[0_2px_18px_rgba(0,0,0,0.03)]"
                        >
                          <div>
                            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                              {code}
                            </div>
                            <div className="text-sm font-extrabold text-zinc-900">
                              {formatDateDisplay(r.date)}
                            </div>
                          </div>

                          <div className="min-w-0 overflow-hidden">
                            <div className="truncate text-sm font-extrabold text-zinc-800">{r.requester}</div>
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
                            <div className="text-xs font-semibold text-zinc-400">{r.liters} LITROS</div>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest ${statusBadge(r.status)}`}
                            >
                              {statusLabel(r.status)}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-3">
                            {showJustificar ? (
                              <button
                                type="button"
                                onClick={() => justificar(r)}
                                className="inline-flex h-9 items-center gap-3 rounded-full bg-blue-600 px-4 text-[11px] font-extrabold uppercase tracking-widest text-white hover:bg-blue-700"
                              >
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/10">
                                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                                </span>
                                JUSTIFICAR
                              </button>
                            ) : (
                              <div className="h-9" />
                            )}

                            <button
                              type="button"
                              onClick={() => toast.message("Detalhes do registo (em breve).")}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                              title="Ver"
                            >
                              <Eye className="h-4 w-4" />
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

          {/* Footer institucional */}
          <div className="bg-[#0B1220] px-8 py-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                PUMANGOL GOVERNANCE
              </div>

              <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-200/80">
                RASTREABILIDADE INSTITUCIONAL ATIVA
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-zinc-100">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                OPERADOR: {operatorLabel}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

