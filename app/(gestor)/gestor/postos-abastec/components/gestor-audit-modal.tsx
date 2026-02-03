"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import type { StationAuditStatus } from "@/app/lib/api/stations";
import { useStationAudit } from "@/app/lib/api/stations-hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TabKey = "TODOS" | "PENDENTES" | "REGULARIZADOS";

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function statusBadge(status: "pending" | "regularized" | "other") {
  if (status === "pending") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "regularized") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function tabButton(active: boolean) {
  return active
    ? "bg-[#0B1220] text-white border-[#0B1220]"
    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50";
}

function parseNumberLike(v: string) {
  const cleaned = String(v ?? "").replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  const both = cleaned.includes(".") && cleaned.includes(",");
  const normalized = both ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${min}` };
}

function extractVehicle(text: string) {
  const t = String(text ?? "");
  const m =
    t.match(/\b[A-Z]{2,3}-?\d{2}-?[A-Z]{2,3}\b/) ??
    t.match(/\b[A-Z]{2}\d{2}[A-Z]{2}\b/i);
  return m ? m[0].toUpperCase() : null;
}

function extractLiters(text: string) {
  const m = String(text ?? "").match(/(\d+(?:[.,]\d+)?)\s*(?:L|LITROS)\b/i);
  if (!m) return null;
  const n = parseNumberLike(m[1]);
  return n > 0 ? n : null;
}

function extractAmount(text: string) {
  const t = String(text ?? "");
  const m1 = t.match(/\b(?:KZ|AOA)\s*([0-9][0-9.,]*)/i);
  const m2 = t.match(/([0-9][0-9.,]*)\s*(?:KZ|AOA)\b/i);
  const raw = (m1?.[1] ?? m2?.[1]) || null;
  if (!raw) return null;
  const n = parseNumberLike(raw);
  return n > 0 ? n : null;
}

function normalizeTicketStatus(status: string): "pending" | "regularized" | "other" {
  const s = String(status || "").toLowerCase();
  if (s.includes("regular") || s.includes("closed") || s.includes("resolved") || s.includes("done")) return "regularized";
  if (s.includes("open") || s.includes("pend") || s.includes("waiting")) return "pending";
  return "other";
}

export default function GestorAuditModal({
  open,
  onOpenChange,
  stationId,
  stationName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stationId: string | null;
  stationName: string | null;
}) {
  const [tab, setTab] = useState<TabKey>("TODOS");

  useEffect(() => {
    if (!open) return;
    setTab("TODOS");
  }, [open, stationId]);

  const apiStatus: StationAuditStatus = tab === "TODOS" ? "all" : tab === "PENDENTES" ? "pending" : "regularized";
  const auditQuery = useStationAudit(open ? stationId : null, apiStatus);

  const stats = useMemo(() => {
    const d = auditQuery.data;
    if (!d) return null;
    return {
      totalLiters: parseNumberLike(d.total_volume),
      totalKz: parseNumberLike(d.financial_impact),
      pending: d.pending_tickets,
      regularized: d.regularized_tickets,
      count: d.total_tickets,
      risk: parseNumberLike(d.anomaly_risk),
    };
  }, [auditQuery.data]);

  const rows = useMemo(() => {
    const d = auditQuery.data;
    if (!d) return [];
    return d.tickets.map((t) => {
      const dt = formatDateTime(t.created_at);
      const vehicle = extractVehicle(`${t.subject} ${t.description} ${t.resolution ?? ""}`) ?? "—";
      const liters = extractLiters(`${t.subject} ${t.description}`) ?? null;
      const amount = extractAmount(`${t.subject} ${t.description}`) ?? null;
      const normalized = normalizeTicketStatus(t.status);
      const statusLabel = (t.status_display || t.status || "").toString().toUpperCase();
      return {
        id: t.id,
        code: t.ticket_code,
        date: dt.date,
        time: dt.time,
        entity: t.requested_by_name || t.requested_by_email,
        entitySub: t.company_name || "",
        vehicle,
        amount,
        liters,
        normalized,
        statusLabel,
      };
    });
  }, [auditQuery.data]);

  function approve() {
    toast.message("Ação disponível em breve.");
  }

  function reject() {
    toast.message("Ação disponível em breve.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[980px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:left-[calc(50%+132px)]">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {stationName ? `Auditoria - ${stationName}` : "Módulo de Auditoria"}
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
                    {stationName?.toUpperCase() ?? "POSTO"}
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
                  {(stats?.totalLiters ?? 0).toFixed(1)} <span className="text-base font-extrabold text-zinc-400">L</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Impacto financeiro
                </div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-700">
                  Kz{formatKz(stats?.totalKz ?? 0)}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Risco de anomalia
                </div>
                <div className="mt-1 text-3xl font-extrabold text-blue-600">
                  {(stats?.risk ?? 0).toFixed(1)}%
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
                TODOS ({stats?.count ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab("PENDENTES")}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "PENDENTES")}`}
              >
                PENDENTES ({stats?.pending ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab("REGULARIZADOS")}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "REGULARIZADOS")}`}
              >
                REGULARIZADOS ({stats?.regularized ?? 0})
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
                    {auditQuery.isLoading ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
                        <div className="text-sm font-semibold text-zinc-500">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                            A carregar auditoria...
                          </span>
                        </div>
                      </div>
                    ) : auditQuery.isError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
                        <div className="text-sm font-semibold text-red-700">Falha ao carregar auditoria.</div>
                      </div>
                    ) : null}

                    {rows.map((r) => {
                      const showActions = r.normalized === "pending";
                      return (
                        <div
                          key={r.id}
                          className="grid grid-cols-[180px_minmax(0,1.2fr)_180px_200px_160px_140px] items-center gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_2px_18px_rgb(0,0,0,0.03)]"
                        >
                      <div>
                        <div className="text-sm font-extrabold text-zinc-800">{r.code}</div>
                        <div className="text-sm font-bold text-zinc-500">{r.date}</div>
                        {r.time ? <div className="text-xs font-semibold text-zinc-400">{r.time}</div> : null}
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <div className="truncate text-sm font-extrabold text-zinc-800">
                          {r.entity}
                        </div>
                        <div className="truncate whitespace-nowrap text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                          {(r.entitySub || "FROTA PARCEIRA").toUpperCase()}
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-zinc-700">
                          {r.vehicle}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-zinc-800">
                          {typeof r.amount === "number" ? `Kz ${formatKz(r.amount)}` : "—"}
                        </div>
                        <div className="text-xs font-semibold text-zinc-400">
                          {typeof r.liters === "number" ? `${r.liters.toFixed(1)} LITROS` : "—"}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest ${statusBadge(r.normalized)}`}
                        >
                          {r.statusLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {showActions ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approve()}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Aprovar"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reject()}
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

                    {!auditQuery.isLoading && !auditQuery.isError && rows.length === 0 ? (
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

