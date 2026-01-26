import { AlertTriangle, BarChart3, Bolt, CheckCircle2, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type GestorKpiCard = {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  value: string;
  title: string;
  subtitle: string;
  pillLabel: string;
  pillClass: string;
};

export const kpiCards: GestorKpiCard[] = [
  {
    icon: AlertTriangle,
    iconBgClass: "bg-red-50",
    iconClass: "text-red-600",
    value: "4",
    title: "Tickets Críticos / Atrasados",
    subtitle: "SLA Breach Risk: Alto",
    pillLabel: "+2 vs ontem",
    pillClass: "bg-red-50 text-red-700 border border-red-100",
  },
  {
    icon: Bolt,
    iconBgClass: "bg-amber-50",
    iconClass: "text-amber-700",
    value: "0",
    title: "Em Análise / Curso",
    subtitle: "Tempo médio análise: 2h",
    pillLabel: "Dentro do prazo",
    pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  {
    icon: CheckCircle2,
    iconBgClass: "bg-emerald-50",
    iconClass: "text-emerald-700",
    value: "142",
    title: "Resolvidos (Este Mês)",
    subtitle: "Taxa de aprovação: 92%",
    pillLabel: "+12% vol.",
    pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  {
    icon: TrendingUp,
    iconBgClass: "bg-blue-50",
    iconClass: "text-blue-700",
    value: "KZ 1.45/L",
    title: "Eficiência de Custo",
    subtitle: "Média de mercado: 300KZ",
    pillLabel: "Otimizado",
    pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
];

export type GestorTicketRow = {
  id: string;
  code: string;
  subject: string;
  type: string;
  requesterName: string;
  requesterRole: string;
  date: string;
  slaLabel: string;
  status: "EM ANÁLISE" | "ABERTO" | "ATRIBUÍDO" | "REGULARIZAÇÃO" | "CONCLUÍDO";
  attentionLevel: "high" | "medium" | "low";
};

export const ticketsRows: GestorTicketRow[] = [
  {
    id: "t1",
    code: "TKT-2024-001",
    subject: "Solicitação Novo Cartão - Cliente Lorrys",
    type: "PEDIDO CARTAO",
    requesterName: "Lorrys",
    requesterRole: "Cliente",
    date: "5/20/2024",
    slaLabel: "ATRASADO +48H",
    status: "EM ANÁLISE",
    attentionLevel: "high",
  },
  {
    id: "t2",
    code: "TKT-2024-002",
    subject: "Abastecimento Manual - Emergência",
    type: "ABASTECIMENTO MANUAL",
    requesterName: "Lorrys",
    requesterRole: "Cliente",
    date: "5/21/2024",
    slaLabel: "ATRASADO +48H",
    status: "ABERTO",
    attentionLevel: "high",
  },
  {
    id: "t3",
    code: "TKT-2024-004",
    subject: "Erro de Leitura Chip",
    type: "SUPORTE",
    requesterName: "Lorrys",
    requesterRole: "Cliente",
    date: "5/21/2024",
    slaLabel: "ATRASADO +48H",
    status: "ATRIBUÍDO",
    attentionLevel: "medium",
  },
  {
    id: "t4",
    code: "TKT-2024-005",
    subject: "Regularização Abastecimento - Fim de Semana",
    type: "ABASTECIMENTO MANUAL",
    requesterName: "Maria Santos",
    requesterRole: "Cliente",
    date: "5/18/2024",
    slaLabel: "ATRASADO +48H",
    status: "REGULARIZAÇÃO",
    attentionLevel: "low",
  },
  {
    id: "t5",
    code: "TKT-2024-006",
    subject: "Cartão emitido com sucesso",
    type: "PEDIDO CARTAO",
    requesterName: "Lorrys",
    requesterRole: "Cliente",
    date: "5/12/2024",
    slaLabel: "",
    status: "CONCLUÍDO",
    attentionLevel: "low",
  },
  {
    id: "t6",
    code: "TKT-2024-007",
    subject: "Recarga confirmada",
    type: "CARREGAMENTO",
    requesterName: "Maria Santos",
    requesterRole: "Cliente",
    date: "5/10/2024",
    slaLabel: "",
    status: "CONCLUÍDO",
    attentionLevel: "low",
  },
];

export const costSeries = [
  { day: "Seg", value: 22 },
  { day: "Ter", value: 19 },
  { day: "Qua", value: 28 },
  { day: "Qui", value: 26 },
  { day: "Sex", value: 30 },
  { day: "Sáb", value: 18 },
  { day: "Dom", value: 16 },
];

export const volumeDistribution = [
  { name: "Aberto", value: 42, color: "#3b82f6" },
  { name: "Aprovado", value: 98, color: "#10b981" },
  { name: "Em Análise", value: 22, color: "#f59e0b" },
  { name: "Regularização", value: 8, color: "#ef4444" },
];

export const slaPerformance = {
  value: 94.2,
  subtitle: "Dentro do SLA nas últimas 24h",
};

