"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CreditCard, Fuel, MapPin, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";

import { getStoredSession, type AppSession } from "@/app/lib/auth/session";
import { ApiError } from "@/app/lib/api/api-client";
import { useCards } from "@/app/lib/api/cards-hooks";
import { useTickets } from "@/app/lib/api/tickets-hooks";
import { useDashboard } from "@/app/lib/api/dashboard-hooks";

import ActivityCard from "@/app/(client)/painel/components/activity-card";
import HistoryPanel from "@/app/(client)/painel/components/history-panel";
import QuickActions from "@/app/(client)/painel/components/quick-actions";
import StatCards from "@/app/(client)/painel/components/stat-cards";
import SupportAIWidget from "@/app/(client)/painel/components/support-ai-widget";
import UserSummaryCard from "@/app/(client)/painel/components/user-summary-card";

import type { StatCard, HistoryItem } from "@/app/(client)/painel/lib/types";

/* ── Quick-action config (static UI, not data) ── */
const quickActions = [
  { id: "new_fuel", icon: Fuel, title: "Novo", subtitle: "Abastecimento", kind: "success" as const },
  { id: "cards", icon: CreditCard, title: "Ver", subtitle: "Cartões", kind: "info" as const },
  { id: "stations", icon: MapPin, title: "Localizar", subtitle: "Postos", kind: "violet" as const },
  { id: "support_ai", icon: Bot, title: "Suporte IA", subtitle: "Urgente", kind: "danger" as const },
];

/* ── Helpers ── */
function parseKz(v: string | undefined | null): number {
  if (!v) return 0;
  return Number(String(v).replace(/[^\d.,-]/g, "").replace(",", ".")) || 0;
}

function formatKz(v: number): string {
  return `Kz ${new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)}`;
}

function getTodayLabel() {
  try {
    const d = new Date();
    return new Intl.DateTimeFormat("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
      .format(d)
      .toUpperCase();
  } catch {
    return "";
  }
}

function statusLabel(apiStatus: string): string {
  const map: Record<string, string> = {
    open: "ABERTO",
    in_analysis: "EM ANÁLISE",
    assigned: "ATRIBUÍDO",
    resolved: "RESOLVIDO",
    closed: "CONCLUÍDO",
    reopened: "REABERTO",
  };
  return map[apiStatus] ?? apiStatus.toUpperCase();
}

export default function MeuPainelClient() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const name = session?.name ?? "Cliente";
  const today = useMemo(() => getTodayLabel(), []);

  /* ── API queries ── */
  const cardsQuery = useCards();
  const ticketsQuery = useTickets({ page: 1, page_size: 50 });
  const dashboardQuery = useDashboard("month");

  /* ── Toast errors (deduplicated) ── */
  useEffect(() => {
    const errors: string[] = [];
    if (cardsQuery.isError) {
      const err = cardsQuery.error;
      errors.push(err instanceof ApiError ? err.message : "Falha ao carregar cartões.");
    }
    if (ticketsQuery.isError) {
      const err = ticketsQuery.error;
      errors.push(err instanceof ApiError ? err.message : "Falha ao carregar tickets.");
    }
    // Dashboard may 403 for clients — that's ok, we just don't show the chart
    const combined = errors.join("|");
    if (!combined || lastErrorRef.current === combined) return;
    lastErrorRef.current = combined;
    for (const msg of errors) toast.error(msg);
  }, [cardsQuery.isError, cardsQuery.error, ticketsQuery.isError, ticketsQuery.error]);

  /* ── Derived: primary card info ── */
  const primaryCard = useMemo(() => {
    if (!cardsQuery.data?.length) return null;
    // Prefer the first active card
    const active = cardsQuery.data.find((c) => c.status === "active");
    return active ?? cardsQuery.data[0];
  }, [cardsQuery.data]);

  const companyName = primaryCard?.company_name ?? undefined;

  const totalBalance = useMemo(() => {
    if (!cardsQuery.data?.length) return 0;
    return cardsQuery.data.reduce((acc, c) => acc + parseKz(c.current_balance), 0);
  }, [cardsQuery.data]);

  /* ── Derived: tickets ── */
  const allTickets = ticketsQuery.data ?? [];
  const pendingTickets = useMemo(() => {
    return allTickets.filter((t) => t.status === "open" || t.status === "in_analysis" || t.status === "assigned");
  }, [allTickets]);

  /* ── Stat cards from real data ── */
  const statCardsData = useMemo<StatCard[]>(() => {
    const cardUid = primaryCard?.uid;
    const lastFour = cardUid ? cardUid.slice(-4) : "—";

    return [
      {
        icon: CreditCard,
        iconBgClass: "bg-blue-50",
        iconClass: "text-blue-700",
        badge: primaryCard?.status === "active"
          ? { label: "OK", className: "bg-emerald-50 text-emerald-700" }
          : primaryCard?.status === "blocked"
            ? { label: "Bloqueado", className: "bg-red-50 text-red-700" }
            : undefined,
        value: formatKz(totalBalance),
        title: "Saldo Disponível",
        subtitle: `Cartão final ${lastFour}`,
      },
      {
        icon: Fuel,
        iconBgClass: "bg-emerald-50",
        iconClass: "text-emerald-700",
        badge: dashboardQuery.data?.cost_efficiency_status
          ? { label: dashboardQuery.data.cost_efficiency_status, className: "bg-emerald-50 text-emerald-700" }
          : undefined,
        value: dashboardQuery.data?.cost_efficiency ?? "—",
        title: "Eficiência de Custo",
        subtitle: dashboardQuery.data?.market_average
          ? `Média mercado: ${dashboardQuery.data.market_average}`
          : "Dados do dashboard",
      },
      {
        icon: Ticket,
        iconBgClass: "bg-amber-50",
        iconClass: "text-amber-700",
        value: String(pendingTickets.length),
        title: "Solicitações",
        subtitle: "Pendentes de aprovação",
      },
      {
        icon: Sparkles,
        iconBgClass: "bg-violet-50",
        iconClass: "text-violet-700",
        value: dashboardQuery.data?.sla_performance
          ? `${dashboardQuery.data.sla_performance}%`
          : "—",
        title: "Performance SLA",
        subtitle: dashboardQuery.data?.sla_performance_label || "—",
      },
    ];
  }, [primaryCard, totalBalance, pendingTickets.length, dashboardQuery.data]);

  /* ── History items from recent tickets ── */
  const historyItems = useMemo<HistoryItem[]>(() => {
    // Take the 3 most recent tickets
    const recent = [...allTickets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    return recent.map((t) => {
      const isRefuel = t.ticket_type === "manual_refuel";
      const isTopup = t.ticket_type === "account_topup";
      return {
        title: t.subject || t.ticket_type_display,
        meta: `${new Date(t.created_at).toLocaleDateString("pt-PT")} • ${t.company_name || "—"}`,
        amount: isTopup ? "+ Carregamento" : isRefuel ? "- Abastecimento" : t.ticket_code,
        amountClass: isTopup ? "text-emerald-700" : "text-zinc-700",
        icon: isRefuel ? Fuel : CreditCard,
        iconWrapClass: isTopup ? "bg-emerald-50" : "bg-zinc-100",
        iconClass: isTopup ? "text-emerald-700" : "text-zinc-600",
      };
    });
  }, [allTickets]);

  /* ── Recent requests for sidebar ── */
  const recentRequests = useMemo(() => {
    const recent = [...allTickets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    return recent.map((t) => ({
      title: (t.subject || t.ticket_type_display).slice(0, 24) + ((t.subject || "").length > 24 ? "..." : ""),
      status: statusLabel(t.status),
    }));
  }, [allTickets]);

  /* ── Chart data from dashboard daily costs ── */
  const chartData = useMemo(() => {
    if (!dashboardQuery.data?.daily_costs?.length) return [];
    return dashboardQuery.data.daily_costs.map((d) => ({
      day: d.day,
      value: Number(d.cost) || 0,
    }));
  }, [dashboardQuery.data]);

  const isLoading = cardsQuery.isLoading || ticketsQuery.isLoading;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <UserSummaryCard
        todayLabel={today}
        name={name}
        companyName={companyName}
        vehicleRegistration={primaryCard?.uid ? `${primaryCard.uid.slice(0, 4)}...${primaryCard.uid.slice(-4)}` : undefined}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 text-sm font-semibold text-zinc-500 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            A carregar dados do painel...
          </span>
        </div>
      ) : null}

      <StatCards cards={statCardsData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="text-amber-500 text-sm">⚡</span> Acesso Rápido
          </div>

          <QuickActions
            actions={quickActions}
            onAction={(a) => {
              if (a.id === "support_ai") setSupportOpen(true);
            }}
          />

          <ActivityCard data={chartData} isLoading={dashboardQuery.isLoading} />
        </div>

        <div className="space-y-4">
          {dashboardQuery.data?.cost_efficiency ? (
            <div className="flex justify-end">
              <div className="text-[13px] font-bold text-zinc-900">{dashboardQuery.data.cost_efficiency}</div>
            </div>
          ) : null}

          <HistoryPanel items={historyItems} recentRequests={recentRequests} />
        </div>
      </div>

      <SupportAIWidget open={supportOpen} onOpenChange={setSupportOpen} name={name} />
    </div>
  );
}
