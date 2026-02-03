"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, History, Play, ShieldCheck, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@/app/lib/api/api-client";
import type { StationAuditStatus } from "@/app/lib/api/stations";
import { useStationAudit } from "@/app/lib/api/stations-hooks";
import { useJustifySupportTicket } from "@/app/lib/api/support-tickets-hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type TabKey = "TODOS" | "PENDENTES" | "REGULARIZADOS";

const justifySchema = z.object({
  justification: z.string().trim().min(1, "Este campo é obrigatório."),
});

type JustifyValues = z.infer<typeof justifySchema>;

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
    : "bg-white text-zinc-500 border-transparent hover:text-zinc-700";
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

function parseNumberLike(v: string) {
  const cleaned = String(v ?? "").replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  const both = cleaned.includes(".") && cleaned.includes(",");
  const normalized = both ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
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

export default function SupportAuditModal({
  open,
  onOpenChange,
  stationId,
  stationName,
  operatorLabel = "ANA SUPORTE",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stationId: string | null;
  stationName: string | null;
  operatorLabel?: string;
}) {
  const [tab, setTab] = useState<TabKey>("TODOS");
  const [justifyOpen, setJustifyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{ id: string; code: string; entity: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab("TODOS");
  }, [open, stationId]);

  const apiStatus: StationAuditStatus = tab === "TODOS" ? "all" : tab === "PENDENTES" ? "pending" : "regularized";
  const auditQuery = useStationAudit(open ? stationId : null, apiStatus);
  const justifyMutation = useJustifySupportTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setError,
  } = useForm<JustifyValues>({
    resolver: zodResolver(justifySchema),
    mode: "onChange",
    defaultValues: { justification: "" },
  });

  useEffect(() => {
    if (!justifyOpen) {
      reset({ justification: "" });
      setSelectedTicket(null);
    }
  }, [justifyOpen, reset]);

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

  const dataState =
    (stats?.pending ?? 0) === 0
      ? { label: "DADOS REGULARIZADOS", cls: "text-emerald-700 border-emerald-100 bg-emerald-50/70", iconCls: "text-emerald-600" }
      : { label: "DADOS PENDENTES", cls: "text-blue-700 border-blue-100 bg-blue-50/70", iconCls: "text-blue-600" };

  function openJustify(args: { id: string; code: string; entity: string }) {
    if (!stationId) return;
    setSelectedTicket(args);
    setJustifyOpen(true);
  }

  async function submitJustify(values: JustifyValues) {
    if (!stationId || !selectedTicket?.id) return;
    try {
      await justifyMutation.mutateAsync({
        stationId,
        ticketId: selectedTicket.id,
        justification: values.justification.trim(),
      });
      toast.success("Ticket regularizado com sucesso.");
      setJustifyOpen(false);
    } catch (e) {
      if (e instanceof ApiError) {
        const msg = e.body?.errors?.justification?.[0];
        if (msg) setError("justification", { type: "server", message: msg });
        toast.error(e.message);
      } else {
        toast.error("Falha ao justificar ticket.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1120px] overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(0,0,0,0.35)] **:data-dialog-close:hidden lg:left-[calc(50%+132px)]">
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
                  {(stats?.totalLiters ?? 0).toFixed(1)}{" "}
                  <span className="text-base font-extrabold text-zinc-400">L</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Impacto financeiro
                </div>
                <div className="mt-1 text-3xl font-extrabold text-emerald-700">
                  Kz{formatKz(stats?.totalKz ?? 0)}
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
                TODOS ({stats?.count ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab("PENDENTES")}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tabButton(tab === "PENDENTES")}`}
              >
                PENDENTES ({stats?.pending ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setTab("REGULARIZADOS")}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tabButton(tab === "REGULARIZADOS")}`}
              >
                REGULARIZADOS ({stats?.regularized ?? 0})
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
                      const showJustificar = r.normalized === "pending";
                      return (
                        <div
                          key={r.id}
                          className="grid grid-cols-[180px_minmax(0,1.2fr)_170px_190px_150px_220px] items-center gap-4 rounded-2xl border border-zinc-100 bg-white px-6 py-4 shadow-[0_2px_18px_rgba(0,0,0,0.03)]"
                        >
                          <div>
                            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                              {r.code}
                            </div>
                            <div className="text-sm font-extrabold text-zinc-900">
                              {r.date}
                            </div>
                            {r.time ? (
                              <div className="text-xs font-semibold text-zinc-400">{r.time}</div>
                            ) : null}
                          </div>

                          <div className="min-w-0 overflow-hidden">
                            <div className="truncate text-sm font-extrabold text-zinc-800">{r.entity}</div>
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

                          <div className="flex items-center justify-end gap-3">
                            {showJustificar ? (
                              <button
                                type="button"
                                onClick={() => openJustify({ id: r.id, code: r.code, entity: r.entity })}
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

      <Dialog open={justifyOpen} onOpenChange={setJustifyOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader className="pr-12">
            <DialogTitle className="text-base font-extrabold text-zinc-900">
              Justificar / Regularizar Ticket
            </DialogTitle>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              {selectedTicket ? (
                <span>
                  <span className="font-extrabold text-zinc-700">{selectedTicket.code}</span> •{" "}
                  <span className="text-zinc-600">{selectedTicket.entity}</span>
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(submitJustify)} className="px-6 py-6">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Justificativa
            </div>
            <Textarea
              {...register("justification")}
              placeholder="Descreve a justificativa da regularização..."
              className={[
                "mt-2 min-h-[140px] rounded-2xl",
                errors.justification ? "border-red-300 focus-visible:ring-red-500/20" : "",
              ].join(" ")}
            />
            {errors.justification?.message ? (
              <div className="mt-2 text-xs font-semibold text-red-600">{errors.justification.message}</div>
            ) : null}

            <DialogFooter className="mt-6">
              <button
                type="button"
                onClick={() => setJustifyOpen(false)}
                className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 hover:text-zinc-600"
                disabled={justifyMutation.isPending}
              >
                Cancelar
              </button>
              <Button
                type="submit"
                className="h-11 rounded-2xl bg-blue-600 px-8 font-extrabold hover:bg-blue-700"
                disabled={!isValid || justifyMutation.isPending}
              >
                {justifyMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    A submeter...
                  </span>
                ) : (
                  "Regularizar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

