"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Clock,
  Download,
  FileDown,
  FileSpreadsheet,
  Fuel,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Zap,
  Users,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import type { ReportsRange, TabKey, TopVehicleRow } from "@/app/(gestor)/gestor/relatorios-kpis/lib/mock-relatorios-kpis";
import { abastecimentoMock, fuelEventsMock, kpiTemplates, operacionalMock, rangeLabel, securityMock } from "@/app/(gestor)/gestor/relatorios-kpis/lib/mock-relatorios-kpis";
import { applyRange, averageCostPerVehicleKz, topVehiclesFromEvents } from "@/app/(gestor)/gestor/relatorios-kpis/lib/relatorios-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function badgeEfficiency(tag: TopVehicleRow["efficiency"]) {
  if (tag === "ALTO_CUSTO") return "bg-red-50 text-red-700 border-red-100";
  return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

function labelEfficiency(tag: TopVehicleRow["efficiency"]) {
  return tag === "ALTO_CUSTO" ? "Alto Custo" : "Eficiente";
}

function kpiCardTheme(iconColor: string) {
  // Borda colorida bem sutil + shadow leve para destacar do fundo branco (igual ao print)
  if (iconColor.includes("text-emerald")) {
    return "border-emerald-100/60 shadow-[0_6px_22px_rgba(16,185,129,0.06)]";
  }
  if (iconColor.includes("text-blue")) {
    return "border-blue-100/60 shadow-[0_6px_22px_rgba(59,130,246,0.06)]";
  }
  if (iconColor.includes("text-violet")) {
    return "border-violet-100/60 shadow-[0_6px_22px_rgba(139,92,246,0.06)]";
  }
  return "border-zinc-200/70 shadow-[0_6px_22px_rgba(15,23,42,0.04)]";
}

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
}

function formatKz2(v: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function formatCompactKz(v: number) {
  return new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(v);
}

function tabAccent(tab: TabKey) {
  if (tab === "ABASTECIMENTO") return { text: "text-emerald-700", underline: "bg-emerald-500", icon: "text-emerald-600" };
  if (tab === "PERFORMANCE") return { text: "text-violet-700", underline: "bg-violet-500", icon: "text-violet-600" };
  return { text: "text-blue-700", underline: "bg-blue-500", icon: "text-blue-600" };
}

export default function GestorRelatoriosKpisClient() {
  const [tab, setTab] = useState<TabKey>("PERFORMANCE");
  const [range, setRange] = useState<ReportsRange>("LAST_30");
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);

  const now = useMemo(() => new Date(Date.UTC(2026, 0, 25, 12, 0, 0)), []);
  const filteredEvents = useMemo(() => applyRange(fuelEventsMock, range, now), [range, now]);
  const topVehicles = useMemo(() => topVehiclesFromEvents(filteredEvents), [filteredEvents]);

  const abastecimentoComputed = useMemo(() => {
    const totalLiters = filteredEvents.reduce((acc, e) => acc + e.liters, 0);
    const totalKz = filteredEvents.reduce((acc, e) => acc + e.costKz, 0);
    const costPerLiter = totalLiters > 0 ? totalKz / totalLiters : 0;
    return {
      totalLiters,
      costPerLiter,
      manualRatePct: abastecimentoMock.kpis.manualRatePct,
      irregularities: abastecimentoMock.kpis.irregularities,
    };
  }, [filteredEvents]);

  const computedKpis = useMemo(() => {
    const avg = averageCostPerVehicleKz(filteredEvents);
    const avgRounded = Math.round(avg || 0);

    // mocks "inteligentes" baseados nos eventos filtrados
    const savings = Math.round((filteredEvents.length || 1) * 145);
    const fraudReduction = Math.min(35, 10 + Math.round((filteredEvents.length || 0) * 1.2));
    const activeDrivers = 32 + Math.min(18, new Set(filteredEvents.map((e) => e.matricula)).size * 5);

    return [
      { ...kpiTemplates[0], value: `KZ ${avgRounded || 210}` },
      { ...kpiTemplates[1], value: `KZ ${savings || 1450}` },
      { ...kpiTemplates[2], value: `${fraudReduction || 15}%` },
      { ...kpiTemplates[3], value: `${activeDrivers || 42}` },
    ];
  }, [filteredEvents]);

  const tabs = useMemo(() => {
    return [
      { key: "OPERACIONAL" as const, label: "Operacional & Tickets", icon: TrendingUp },
      { key: "ABASTECIMENTO" as const, label: "Abastecimento & Financeiro", icon: Fuel },
      { key: "PERFORMANCE" as const, label: "Performance & Equipa", icon: Users },
    ];
  }, []);

  async function exportExcel() {
    if (exporting) return;
    setExporting("xlsx");
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(
        topVehicles.map((r) => ({
          Matrícula: r.matricula,
          "Consumo (L)": r.liters,
          "Custo Total (KZ)": r.costKz,
          Eficiência: labelEfficiency(r.efficiency),
        })),
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Top Veículos");
      XLSX.writeFile(wb, `relatorio-kpis-${rangeLabel(range).replace(/\s+/g, "-").toLowerCase()}.xlsx`);
      toast.success("Excel gerado.");
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
      doc.text("Centro de Inteligência Frota+", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Filtro: ${rangeLabel(range)}`, margin, y);
      y += 18;

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Top Veículos com Maior Consumo", margin, y + 12);
      y += 34;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("MATRÍCULA", margin, y);
      doc.text("CONSUMO (L)", margin + 150, y);
      doc.text("CUSTO (KZ)", margin + 260, y);
      doc.text("EFICIÊNCIA", margin + 360, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      for (const r of topVehicles) {
        doc.text(r.matricula, margin, y);
        doc.text(String(r.liters), margin + 150, y);
        doc.text(formatKz2(r.costKz), margin + 260, y);
        doc.text(labelEfficiency(r.efficiency), margin + 360, y);
        y += 16;
      }

      doc.save(`relatorio-kpis-${rangeLabel(range).replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("PDF gerado.");
    } catch {
      toast.error("Falha ao gerar PDF.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1240px] space-y-6">
        {/* Header card */}
        <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-extrabold text-zinc-900">Centro de Inteligência Frota+</div>
              <div className="mt-1 text-sm font-semibold text-zinc-500">
                Analytics avançado para tomada de decisão estratégica.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="h-11 rounded-2xl">
                    <CalendarDays className="h-4 w-4 text-zinc-600" />
                    <span className="font-bold text-zinc-700">{rangeLabel(range)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRange("LAST_30")}>Últimos 30 Dias</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("LAST_7")}>Últimos 7 Dias</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("TODAY")}>Hoje</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={exportExcel}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {exporting === "xlsx" ? "A exportar..." : "Excel"}
              </Button>

              <Button
                type="button"
                className="h-11 rounded-2xl bg-[#0B1220] px-6 hover:bg-[#0E2236]"
                onClick={exportPdf}
                disabled={exporting !== null}
              >
                <FileDown className="h-4 w-4" />
                {exporting === "pdf" ? "A gerar..." : "PDF"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs card */}
        <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="border-b border-zinc-100 px-6">
            <div className="flex flex-wrap gap-10">
              {tabs.map((t) => {
                const active = tab === t.key;
                const Icon = t.icon;
                const accent = tabAccent(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={[
                      "relative cursor-pointer py-4 text-sm font-extrabold",
                      active ? accent.text : "text-zinc-500 hover:text-zinc-700",
                    ].join(" ")}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className={["h-4 w-4", active ? accent.icon : "text-zinc-400"].join(" ")} />
                      {t.label}
                    </span>
                    {active ? <span className={`absolute inset-x-0 bottom-0 h-0.5 ${accent.underline}`} /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-6">
            {tab === "ABASTECIMENTO" ? (
              <div className="space-y-7">
                <div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-emerald-600" />
                    <div className="text-sm font-extrabold text-zinc-900">KPIs de Abastecimento</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(16,185,129,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Consumo Total</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                            {Math.round(abastecimentoComputed.totalLiters).toLocaleString("pt-AO")} L
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Fuel className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(59,130,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Custo Médio/L</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                            KZ {formatKz2(abastecimentoComputed.costPerLiter || 1.62)}
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(139,92,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Abast. Manuais</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                            {abastecimentoComputed.manualRatePct}%
                          </div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">Taxa de Autorização</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-red-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(239,68,68,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Irregularidades</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                            {abastecimentoComputed.irregularities}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">Regularizações necessárias</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    <div className="text-sm font-extrabold text-zinc-900">Tendência de Consumo (7 Dias)</div>
                    <div className="mt-4 h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={abastecimentoMock.consumptionTrend7d} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="fillCons" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.20} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="4 4" />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 700 }} />
                          <Tooltip
                            cursor={{ stroke: "#e4e4e7", strokeWidth: 1 }}
                            contentStyle={{ borderRadius: 12, borderColor: "#e4e4e7", fontWeight: 700, fontSize: 12 }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#fillCons)" activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    <div className="text-sm font-extrabold text-zinc-900">Top Postos (Volume)</div>
                    <div className="mt-4 space-y-3">
                      {abastecimentoMock.topStations.map((s) => (
                        <div key={s.rank} className="flex items-center justify-between rounded-xl bg-zinc-50/60 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-extrabold text-zinc-600">
                              {s.rank}
                            </div>
                            <div className="text-sm font-extrabold text-zinc-800">{s.name}</div>
                          </div>
                          <div className="text-sm font-extrabold text-emerald-700">{s.liters} L</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-6">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                    <div className="text-sm font-extrabold text-zinc-900">Carregamento de Contas</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                      <div className="text-sm font-extrabold text-zinc-900">Métodos Utilizados</div>
                      <div className="mt-4 h-[190px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={abastecimentoMock.topupMethods}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={58}
                              outerRadius={84}
                              paddingAngle={3}
                              stroke="transparent"
                            >
                              {abastecimentoMock.topupMethods.map((m) => (
                                <Cell key={m.name} fill={m.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {abastecimentoMock.topupMethods.map((m) => (
                          <div key={m.name} className="flex items-center justify-between text-xs font-bold text-zinc-500">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                              {m.name}
                            </span>
                            <span className="text-zinc-700">{m.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(16,185,129,0.06)]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs font-bold text-zinc-500">Total Carregado</div>
                              <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                                KZ {formatCompactKz(abastecimentoMock.topupKpis.totalLoadedKz)}
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                              <Banknote className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(59,130,246,0.06)]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs font-bold text-zinc-500">Tempo Médio Atualiz.</div>
                              <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                                {abastecimentoMock.topupKpis.avgUpdateMinutes} min
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                              <Clock className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(245,158,11,0.08)]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs font-bold text-zinc-500">Pendentes Conf.</div>
                              <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                                {abastecimentoMock.topupKpis.pendingConfirmations}
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                        <div className="text-sm font-extrabold text-zinc-900">Fluxo de Caixa (Carregamentos)</div>
                        <div className="mt-4 h-[210px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={abastecimentoMock.cashFlow} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                              <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="4 4" />
                              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 700 }} />
                              <Tooltip
                                cursor={{ fill: "rgba(15,23,42,0.03)" }}
                                contentStyle={{ borderRadius: 12, borderColor: "#e4e4e7", fontWeight: 700, fontSize: 12 }}
                              />
                              <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 10, 10]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : tab === "OPERACIONAL" ? (
              <div className="space-y-7">
                <div>
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-blue-600" />
                    <div className="text-sm font-extrabold text-zinc-900">KPIs de Tickets &amp; Solicitações</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(59,130,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Total Tickets</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.ticketsKpis.totalTickets}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">No período selecionado</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(245,158,11,0.08)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Tempo Médio Resol.</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.ticketsKpis.avgResolutionHours}h</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">Meta: &lt; 8h</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-red-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(239,68,68,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Reabertos</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.ticketsKpis.reopened}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">Controlo de qualidade</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(139,92,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Alertas Postos</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.ticketsKpis.stationAlerts}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">Indisponibilidade rede</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                          <Zap className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    <div className="text-sm font-extrabold text-zinc-900">Tickets por Estado</div>
                    <div className="mt-4 h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={operacionalMock.ticketsByStatus}
                          layout="vertical"
                          margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                        >
                          <CartesianGrid horizontal={false} stroke="#eef2f7" strokeDasharray="4 4" />
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="status"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 12, fontWeight: 700 }}
                            width={90}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(15,23,42,0.03)" }}
                            contentStyle={{ borderRadius: 12, borderColor: "#e4e4e7", fontWeight: 700, fontSize: 12 }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                            {operacionalMock.ticketsByStatus.map((s) => (
                              <Cell key={s.status} fill={s.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    <div className="text-sm font-extrabold text-zinc-900">Distribuição por Prioridade</div>
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={operacionalMock.priorityDistribution}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={62}
                              outerRadius={92}
                              paddingAngle={3}
                              stroke="transparent"
                            >
                              {operacionalMock.priorityDistribution.map((p) => (
                                <Cell key={p.name} fill={p.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-2">
                        {operacionalMock.priorityDistribution.map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-xs font-bold text-zinc-500">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
                              {p.name}
                            </span>
                            <span className="text-zinc-700">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-6">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                    <div className="text-sm font-extrabold text-zinc-900">Gestão de Pedidos de Cartão</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-violet-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(139,92,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Pedidos Totais</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.cardRequests.total}</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(16,185,129,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Aprovação (%)</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.cardRequests.approvalPct}%</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(245,158,11,0.08)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Pendentes</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.cardRequests.pending}</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_6px_22px_rgba(59,130,246,0.06)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-zinc-500">Tempo Médio</div>
                          <div className="mt-2 text-2xl font-extrabold text-zinc-900">{operacionalMock.cardRequests.avgHours}h</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : tab === "PERFORMANCE" ? (
              <div className="space-y-7">
                {/* KPI section */}
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <div className="text-sm font-extrabold text-zinc-900">KPIs de Performance da Frota</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {computedKpis.map((k, idx) => {
                      const Icon = k.icon;
                      const theme = kpiCardTheme(k.iconColor);
                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border bg-white p-5 ${theme}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-500">{k.title}</div>
                              <div className="mt-2 text-2xl font-extrabold text-zinc-900">{k.value}</div>
                              {k.subtitle ? (
                                <div className="mt-1 text-xs font-semibold text-zinc-400">{k.subtitle}</div>
                              ) : null}
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.iconBg} ${k.iconColor}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top vehicles */}
                <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="flex items-start justify-between gap-6 border-b border-zinc-100 px-6 py-5">
                    <div className="text-sm font-extrabold text-zinc-900">Top Veículos com Maior Consumo</div>
                    <div className="text-xs font-semibold text-zinc-400">Baseado em abastecimentos aprovados</div>
                  </div>

                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-50/50">
                          <TableHead>MATRÍCULA</TableHead>
                          <TableHead>CONSUMO (L)</TableHead>
                          <TableHead>CUSTO TOTAL</TableHead>
                          <TableHead>EFICIÊNCIA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topVehicles.map((r) => (
                          <TableRow key={r.matricula}>
                            <TableCell className="py-5">
                              <div className="text-sm font-extrabold text-zinc-900">{r.matricula}</div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="text-sm font-semibold text-zinc-600">{r.liters} L</div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="text-sm font-extrabold text-zinc-900">KZ {formatKz(r.costKz)}</div>
                            </TableCell>
                            <TableCell className="py-5">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold ${badgeEfficiency(r.efficiency)}`}>
                                {labelEfficiency(r.efficiency)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}

                        {topVehicles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="py-16 text-center">
                              <div className="text-sm font-semibold text-zinc-400">Sem dados para este período.</div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Security */}
                <div className="border-t border-zinc-100 pt-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                    <div className="text-sm font-extrabold text-zinc-900">Segurança &amp; Atividade de Gestão</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100/60 bg-white p-6 shadow-[0_6px_22px_rgba(59,130,246,0.06)]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                            Aprovações de Gestor
                          </div>
                          <div className="mt-2 text-3xl font-extrabold text-zinc-900">{securityMock.approvals}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">{securityMock.approvalsSubtitle}</div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <Download className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-red-100/60 bg-white p-6 shadow-[0_6px_22px_rgba(239,68,68,0.06)]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                            Alertas Incomuns
                          </div>
                          <div className="mt-2 text-3xl font-extrabold text-red-600">{securityMock.alerts}</div>
                          <div className="mt-1 text-xs font-semibold text-zinc-400">{securityMock.alertsSubtitle}</div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-linear-to-b from-[#0B1220] to-[#0E2236] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.06)]">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/55">
                        Estado da Auditoria
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm font-extrabold text-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        {securityMock.auditStatusTitle}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-white/45">{securityMock.auditStatusSubtitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
                <div className="text-sm font-semibold text-zinc-500">
                  Conteúdo desta aba (mock) em breve.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

