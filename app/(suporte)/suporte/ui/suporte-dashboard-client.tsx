"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bolt,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  FileDown,
  Filter,
  Inbox,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError } from "@/app/lib/api/api-client";
import { useDashboard } from "@/app/lib/api/dashboard-hooks";
import type { DashboardPeriod, DashboardResponse } from "@/app/lib/api/dashboard";
import { useTickets } from "@/app/lib/api/tickets-hooks";
import { apiTicketToUi } from "@/app/(client)/meus-pedidos/lib/ticket-api-mapper";
import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import type { LucideIcon } from "lucide-react";

type OverviewRange = "MONTH" | "LAST_7" | "TODAY";

function rangeToApiPeriod(range: OverviewRange): DashboardPeriod {
  if (range === "LAST_7") return "week";
  if (range === "MONTH") return "month";
  return "week";
}

function rangeLabel(range: OverviewRange) {
  if (range === "MONTH") return "Este Mês";
  if (range === "LAST_7") return "Últimos 7 dias";
  return "Hoje";
}

type KpiCardData = {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  value: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  pillClass: string;
};

function buildKpiCards(data: DashboardResponse, openCount: number): KpiCardData[] {
  return [
    {
      icon: Inbox,
      iconBgClass: "bg-blue-50",
      iconClass: "text-blue-700",
      value: String(openCount),
      title: "Tickets Abertos",
      subtitle: `Aguardam resposta ou triagem`,
      pillLabel: openCount > 0 ? `${openCount} pendente${openCount > 1 ? "s" : ""}` : "Nenhum",
      pillClass: openCount > 0
        ? "bg-blue-50 text-blue-700 border border-blue-100"
        : "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      icon: Bolt,
      iconBgClass: "bg-amber-50",
      iconClass: "text-amber-700",
      value: String(data.in_analysis_tickets),
      title: "Em Análise / Curso",
      subtitle: `Tempo médio: ${data.average_analysis_time || "—"}`,
      pillLabel: "Dentro do prazo",
      pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      icon: CheckCircle2,
      iconBgClass: "bg-emerald-50",
      iconClass: "text-emerald-700",
      value: String(data.resolved_this_month),
      title: "Resolvidos (Este Mês)",
      subtitle: `Taxa: ${data.approval_rate || "—"}`,
      pillLabel: data.resolved_volume_change || "+0%",
      pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    {
      icon: TrendingUp,
      iconBgClass: "bg-violet-50",
      iconClass: "text-violet-700",
      value: data.average_analysis_time || "—",
      title: "Tempo Médio Resolução",
      subtitle: `Meta SLA: ${data.sla_performance_label || "—"}`,
      pillLabel: data.cost_efficiency_status || "Otimizado",
      pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
  ];
}

function cardTheme(iconClass: string) {
  if (iconClass.includes("text-blue-700")) return "shadow-[0_4px_20px_rgb(59,130,246,0.04)] border-blue-100/10";
  if (iconClass.includes("text-emerald-700")) return "shadow-[0_4px_20px_rgb(16,185,129,0.04)] border-emerald-100/10";
  if (iconClass.includes("text-amber-700")) return "shadow-[0_4px_20px_rgb(245,158,11,0.04)] border-amber-100/10";
  if (iconClass.includes("text-violet-700")) return "shadow-[0_4px_20px_rgb(139,92,246,0.04)] border-violet-100/10";
  return "shadow-sm border-zinc-100";
}

function statusBadgeClass(status: string) {
  if (status === "ABERTO") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "EM ANALISE") return "bg-amber-50 text-amber-800 border-amber-100";
  if (status === "ATRIBUIDO") return "bg-zinc-50 text-zinc-700 border-zinc-200";
  if (status === "CONCLUIDO") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "APROVADO") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-violet-50 text-violet-700 border-violet-100";
}

type TabKey = "ATENCAO" | "PENDENTES" | "EM_CURSO" | "CONCLUIDOS";

export default function SuporteDashboardClient() {
  const [tab, setTab] = useState<TabKey>("ATENCAO");
  const [range, setRange] = useState<OverviewRange>("MONTH");
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  const apiPeriod = rangeToApiPeriod(range);
  const dashboardQuery = useDashboard(apiPeriod);
  const ticketsQuery = useTickets({ page: 1, page_size: 100 });

  useEffect(() => {
    if (!dashboardQuery.isError) return;
    const err = dashboardQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar dashboard.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [dashboardQuery.error, dashboardQuery.isError]);

  const allTickets = useMemo<Ticket[]>(() => {
    const list = ticketsQuery.data ?? [];
    return list.map((t) => apiTicketToUi(t, "Suporte"));
  }, [ticketsQuery.data]);

  const openCount = useMemo(() => {
    return allTickets.filter((t) => t.status === "ABERTO").length;
  }, [allTickets]);

  const kpiCards = useMemo<KpiCardData[]>(() => {
    if (!dashboardQuery.data) return [];
    return buildKpiCards(dashboardQuery.data, openCount);
  }, [dashboardQuery.data, openCount]);

  const categorized = useMemo(() => {
    const completed = allTickets.filter((r) => r.status === "CONCLUIDO" || r.status === "APROVADO");
    const attention = allTickets.filter((r) => {
      if (r.status === "CONCLUIDO" || r.status === "APROVADO") return false;
      return r.priority === "Urgente" || r.priority === "Alta";
    });
    const pending = allTickets.filter((r) => {
      if (r.status !== "ABERTO") return false;
      return !attention.some((a) => a.id === r.id);
    });
    const inProgress = allTickets.filter((r) => {
      if (r.status === "CONCLUIDO" || r.status === "APROVADO" || r.status === "ABERTO") return false;
      return !attention.some((a) => a.id === r.id);
    });
    return { attention, pending, inProgress, completed };
  }, [allTickets]);

  const tabs = useMemo(() => [
    { key: "ATENCAO" as const, label: "Atenção", count: categorized.attention.length, icon: CircleAlert, activeText: "text-red-600", activeUnderline: "bg-red-500" },
    { key: "PENDENTES" as const, label: "Pendentes", count: categorized.pending.length, icon: Clock3, activeText: "text-zinc-900", activeUnderline: "bg-zinc-300" },
    { key: "EM_CURSO" as const, label: "Em Curso", count: categorized.inProgress.length, icon: Zap, activeText: "text-amber-700", activeUnderline: "bg-amber-500" },
    { key: "CONCLUIDOS" as const, label: "Concluídos", count: categorized.completed.length, icon: CircleCheck, activeText: "text-emerald-700", activeUnderline: "bg-emerald-500" },
  ], [categorized]);

  const rows = useMemo(() => {
    if (tab === "ATENCAO") return categorized.attention;
    if (tab === "PENDENTES") return categorized.pending;
    if (tab === "EM_CURSO") return categorized.inProgress;
    return categorized.completed;
  }, [tab, categorized]);

  const filterText = useMemo(() => rangeLabel(range), [range]);

  async function exportExcel() {
    if (exporting) return;
    setExporting("xlsx");
    try {
      const XLSX = await import("xlsx");
      const data = rows.map((r) => ({
        Código: r.code,
        Assunto: r.subject,
        Tipo: r.type,
        Solicitante: r.requester,
        Data: r.createdAt,
        Status: r.status,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");
      XLSX.writeFile(wb, `suporte-tickets-${filterText.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
      toast.success("Exportação Excel gerada.");
    } catch {
      toast.error("Falha ao exportar Excel.");
    } finally {
      setExporting(null);
    }
  }

  async function exportPdf() {
    if (exporting) return;
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const margin = 42;
      let y = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Dashboard Suporte", margin, y);
      y += 22;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Filtro: ${filterText}`, margin, y);
      y += 24;

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CÓDIGO", margin, y);
      doc.text("STATUS", margin + 100, y);
      doc.text("ASSUNTO", margin + 200, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      for (const r of allTickets.slice(0, 30)) {
        doc.text(r.code, margin, y);
        doc.text(r.status, margin + 100, y);
        doc.text(r.subject.slice(0, 50), margin + 200, y);
        y += 14;
        if (y > 780) { doc.addPage(); y = margin; }
      }
      doc.save(`suporte-tickets-${filterText.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("Relatório PDF gerado.");
    } catch {
      toast.error("Falha ao gerar PDF.");
    } finally {
      setExporting(null);
    }
  }

  const isLoading = dashboardQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Visão Geral da Operação</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Monitorização em tempo real de tickets e SLAs.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="h-11 rounded-2xl">
                  <Filter className="h-4 w-4 text-zinc-600" />
                  Filtro:
                  <span className="font-extrabold text-zinc-900">{filterText}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRange("MONTH")}>Este Mês</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("LAST_7")}>Últimos 7 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("TODAY")}>Hoje</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              onClick={exportExcel}
              disabled={exporting !== null}
            >
              <Download className="h-4 w-4" />
              {exporting === "xlsx" ? "A exportar..." : "Exportar Excel"}
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-[#0B1220] px-6 hover:bg-[#0E2236]"
              onClick={exportPdf}
              disabled={exporting !== null}
            >
              <FileDown className="h-4 w-4" />
              {exporting === "pdf" ? "A gerar..." : "Relatório PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 text-sm font-semibold text-zinc-500 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            A carregar dashboard...
          </span>
        </div>
      )}

      {/* KPIs */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((c, i) => {
            const Icon = c.icon;
            const theme = cardTheme(c.iconClass);
            return (
              <div key={i} className={`rounded-2xl border bg-white p-5 ${theme}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBgClass} ${c.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold ${c.pillClass}`}>
                    {c.pillLabel}
                  </span>
                </div>
                <div className="mt-5 text-2xl font-extrabold text-zinc-900">{c.value}</div>
                <div className="mt-1 text-xs font-semibold text-zinc-500">{c.title}</div>
                <div className="mt-1 text-[10px] font-semibold text-zinc-300">{c.subtitle}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tickets table — full width */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="text-sm font-extrabold text-zinc-900">Últimos Tickets</div>
          <div className="mt-1 text-[11px] font-semibold text-zinc-400">
            Visão unificada de todos os estados do workflow.
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-100 px-6">
          <div className="flex flex-wrap gap-8">
            {tabs.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={[
                    "relative cursor-pointer py-4 text-sm font-extrabold",
                    active ? t.activeText : "text-zinc-500 hover:text-zinc-700",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className={["h-4 w-4", active ? t.activeText : "text-zinc-400"].join(" ")} />
                    <span className="font-extrabold">{t.label}</span>
                    <span className="text-zinc-400">({t.count})</span>
                  </span>
                  {active && <span className={`absolute inset-x-0 bottom-0 h-0.5 ${t.activeUnderline}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_160px_140px_140px] gap-4 border-b border-zinc-100 bg-zinc-50/40 px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
          <div>Ticket / Assunto</div>
          <div>Solicitante</div>
          <div>Data</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100">
          {ticketsQuery.isLoading ? (
            <div className="px-6 py-10 text-sm font-semibold text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                A carregar tickets...
              </span>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm font-semibold text-zinc-400">
              Sem registos para este estado.
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_160px_140px_140px] gap-4 px-6 py-5">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span className={[
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      tab === "CONCLUIDOS" ? "bg-emerald-500"
                        : r.priority === "Urgente" ? "bg-red-500"
                        : r.priority === "Alta" ? "bg-amber-500"
                        : "bg-zinc-300",
                    ].join(" ")} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-zinc-900">{r.subject}</div>
                      <div className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                        {r.code} <span className="text-zinc-300">•</span> {r.type}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-zinc-700">
                  <div>{r.requester}</div>
                  <div className="text-xs font-semibold text-zinc-400">{r.requesterRole}</div>
                </div>

                <div className="text-sm font-semibold text-zinc-700">{r.createdAt}</div>

                <div className="flex items-center">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusBadgeClass(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-100 px-6 py-4">
          <a href="/suporte/fila-tickets" className="text-xs font-extrabold text-emerald-700 hover:underline">
            Ver todos os tickets →
          </a>
        </div>
      </div>
    </div>
  );
}
