import { Banknote, Shield, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ReportsRange = "LAST_30" | "LAST_7" | "TODAY";

export function rangeLabel(range: ReportsRange) {
  if (range === "TODAY") return "Hoje";
  if (range === "LAST_7") return "Últimos 7 Dias";
  return "Últimos 30 Dias";
}

export type TabKey = "OPERACIONAL" | "ABASTECIMENTO" | "PERFORMANCE";

export type FuelEvent = {
  id: string;
  dateISO: string; // YYYY-MM-DD
  matricula: string;
  liters: number;
  costKz: number;
};

export type EfficiencyTag = "ALTO_CUSTO" | "EFICIENTE";

export type TopVehicleRow = {
  matricula: string;
  liters: number;
  costKz: number;
  efficiency: EfficiencyTag;
};

export type KpiCard = {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export const fuelEventsMock: FuelEvent[] = [
  { id: "e1", dateISO: "2026-01-25", matricula: "AA-00-BB", liters: 120, costKz: 210 },
  { id: "e2", dateISO: "2026-01-23", matricula: "AA-00-BB", liters: 160, costKz: 240 },
  { id: "e3", dateISO: "2026-01-22", matricula: "XX-99-YY", liters: 140, costKz: 210 },
  { id: "e4", dateISO: "2026-01-20", matricula: "XX-99-YY", liters: 115, costKz: 200 },
  { id: "e5", dateISO: "2026-01-18", matricula: "ZZ-11-CC", liters: 110, costKz: 180 },
  { id: "e6", dateISO: "2026-01-16", matricula: "ZZ-11-CC", liters: 120, costKz: 200 },
  { id: "e7", dateISO: "2026-01-14", matricula: "BB-22-DD", liters: 90, costKz: 150 },
  { id: "e8", dateISO: "2026-01-12", matricula: "BB-22-DD", liters: 120, costKz: 200 },
  { id: "e9", dateISO: "2025-12-28", matricula: "AA-00-BB", liters: 80, costKz: 120 },
  { id: "e10", dateISO: "2025-12-20", matricula: "XX-99-YY", liters: 70, costKz: 110 },
];

export const securityMock = {
  approvals: 128,
  approvalsSubtitle: "Tickets processados este mês",
  alerts: 7,
  alertsSubtitle: "Tentativas fora de padrão/horário",
  auditStatusTitle: "Sistema Ativo & Monitorizado",
  auditStatusSubtitle: "Última verificação de integridade: Há 5 min.",
};

export const kpiTemplates: KpiCard[] = [
  {
    title: "Custo Médio/Viatura",
    value: "KZ 210",
    icon: Banknote,
    iconBg: "bg-zinc-50",
    iconColor: "text-zinc-700",
  },
  {
    title: "Poupança Estimada",
    value: "KZ 1450",
    subtitle: "Controlo otimizado",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  {
    title: "Redução Fraude",
    value: "15%",
    icon: Shield,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
  },
  {
    title: "Motoristas Ativos",
    value: "42",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
  },
];

export const abastecimentoMock = {
  kpis: {
    manualRatePct: 92,
    irregularities: 14,
  },
  consumptionTrend7d: [
    { day: "Seg", value: 420 },
    { day: "Ter", value: 310 },
    { day: "Qua", value: 560 },
    { day: "Qui", value: 460 },
    { day: "Sex", value: 620 },
    { day: "Sáb", value: 210 },
    { day: "Dom", value: 150 },
  ],
  topStations: [
    { rank: 1, name: "Posto Central", liters: 4500 },
    { rank: 2, name: "Posto Norte", liters: 3200 },
    { rank: 3, name: "Posto A1 (Km 40)", liters: 1800 },
  ],
  topupMethods: [
    { name: "Multibanco", value: 52, color: "#3b82f6" },
    { name: "Ordem Saque", value: 18, color: "#f59e0b" },
    { name: "Transferência", value: 30, color: "#10b981" },
  ],
  topupKpis: {
    totalLoadedKz: 45000,
    avgUpdateMinutes: 15,
    pendingConfirmations: 2,
  },
  cashFlow: [
    { label: "Seg", value: 8200 },
    { label: "Ter", value: 5400 },
    { label: "Qua", value: 9900 },
    { label: "Qui", value: 6800 },
  ],
};

export const operacionalMock = {
  ticketsKpis: {
    totalTickets: 154,
    avgResolutionHours: 6.2,
    reopened: 5,
    stationAlerts: 12,
  },
  ticketsByStatus: [
    { status: "Aberto", value: 18, color: "#3b82f6" },
    { status: "Em Curso", value: 42, color: "#3b82f6" },
    { status: "Concluído", value: 118, color: "#10b981" },
    { status: "Atrasado", value: 8, color: "#ef4444" },
  ],
  priorityDistribution: [
    { name: "Alta", value: 28, color: "#f59e0b" },
    { name: "Baixa", value: 20, color: "#3b82f6" },
    { name: "Normal", value: 80, color: "#2563eb" },
    { name: "Urgente", value: 12, color: "#ef4444" },
  ],
  cardRequests: {
    total: 24,
    approvalPct: 88,
    pending: 3,
    avgHours: 4.5,
  },
};

