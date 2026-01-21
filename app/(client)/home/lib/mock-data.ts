import { CreditCard, Fuel, MapPin, Sparkles, Bot, Ticket, type LucideIcon } from "lucide-react";

export type StatCard = {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  badge?: { label: string; className: string };
  value: string;
  title: string;
  subtitle?: string;
};

export type HistoryItem = {
  title: string;
  meta: string;
  amount: string;
  amountClass: string;
  icon: LucideIcon;
  iconWrapClass: string;
  iconClass: string;
};

export const statCards: StatCard[] = [
  {
    icon: CreditCard,
    iconBgClass: "bg-blue-50",
    iconClass: "text-blue-700",
    badge: { label: "OK", className: "bg-emerald-50 text-emerald-700" },
    value: "Kz 120 500",
    title: "Saldo Disponível",
    subtitle: "Cartão final 4829",
  },
  {
    icon: Fuel,
    iconBgClass: "bg-emerald-50",
    iconClass: "text-emerald-700",
    badge: { label: "Normal", className: "bg-emerald-50 text-emerald-700" },
    value: "Kz 35 500",
    title: "Consumo Mensal",
    subtitle: "Aprox. 263 Litros",
  },
  {
    icon: Ticket,
    iconBgClass: "bg-amber-50",
    iconClass: "text-amber-700",
    value: "1",
    title: "Solicitações",
    subtitle: "Pendentes de aprovação",
  },
  {
    icon: Sparkles,
    iconBgClass: "bg-violet-50",
    iconClass: "text-violet-700",
    value: "12.5",
    title: "Eficiência Média",
    subtitle: "Litros / 100km (Est.)",
  },
];

export const quickActions = [
  { icon: Fuel, title: "Novo", subtitle: "Abastecimento", kind: "success" as const },
  { icon: CreditCard, title: "Ver", subtitle: "Cartões", kind: "info" as const },
  { icon: MapPin, title: "Localizar", subtitle: "Postos", kind: "violet" as const },
  { icon: Bot, title: "Suporte IA", subtitle: "Urgente", kind: "danger" as const },
];

export const historyItems: HistoryItem[] = [
  {
    title: "Abastecimento Pumangol Luanda",
    meta: "2024-05-20 • Luanda",
    amount: "- 13 500",
    amountClass: "text-zinc-700",
    icon: Fuel,
    iconWrapClass: "bg-zinc-100",
    iconClass: "text-zinc-600",
  },
  {
    title: "Recarga Mensal",
    meta: "2024-05-18 • Online",
    amount: "+ 500 000",
    amountClass: "text-emerald-700",
    icon: CreditCard,
    iconWrapClass: "bg-emerald-50",
    iconClass: "text-emerald-700",
  },
  {
    title: "Abastecimento Pumangol Benguela",
    meta: "2024-05-10 • Benguela",
    amount: "- 22 000",
    amountClass: "text-zinc-700",
    icon: Fuel,
    iconWrapClass: "bg-zinc-100",
    iconClass: "text-zinc-600",
  },
];

export const recentRequests = [
  { title: "Solicitação Novo Cart...", status: "EM ANÁLISE" },
  { title: "Abastecimento Manu...", status: "ABERTO" },
  { title: "Erro de Leitura Chip", status: "ATRIBUÍDO" },
];

export const chartData = [
  { day: "Ter", value: 18 },
  { day: "Qua", value: 24 },
  { day: "Qui", value: 19 },
  { day: "Sex", value: 26 },
  { day: "Sab", value: 12 },
  { day: "Dom", value: 10 },
];
