import type { GestorTicketRow } from "@/app/(gestor)/gestor/lib/mock-overview";

export type OverviewRange = "MONTH" | "LAST_7" | "TODAY";

export function rangeLabel(range: OverviewRange) {
  if (range === "MONTH") return "Este Mês";
  if (range === "LAST_7") return "Últimos 7 dias";
  return "Hoje";
}

export function parseMDY(dateStr: string) {
  const m = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (!month || !day || !year) return null;
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

export function addDaysUTC(d: Date, days: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days, 12, 0, 0));
}

export function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}

export function applyRange(rows: GestorTicketRow[], range: OverviewRange, now: Date) {
  const nowDay = startOfDayUTC(now);
  let from: Date;
  let to: Date;

  if (range === "TODAY") {
    from = nowDay;
    to = addDaysUTC(nowDay, 1);
  } else if (range === "LAST_7") {
    from = addDaysUTC(nowDay, -6);
    to = addDaysUTC(nowDay, 1);
  } else {
    from = startOfMonthUTC(nowDay);
    to = addDaysUTC(nowDay, 1);
  }

  return rows.filter((r) => {
    const d = parseMDY(r.date);
    if (!d) return false;
    return d >= from && d < to;
  });
}

export function distributionFromRows(rows: GestorTicketRow[]) {
  const counters = new Map<string, number>();
  for (const r of rows) {
    counters.set(r.status, (counters.get(r.status) ?? 0) + 1);
  }
  const colors: Record<string, string> = {
    ABERTO: "#3b82f6",
    "EM ANÁLISE": "#f59e0b",
    "ATRIBUÍDO": "#64748b",
    REGULARIZAÇÃO: "#ef4444",
    "CONCLUÍDO": "#10b981",
  };
  return Array.from(counters.entries())
    .map(([name, value]) => ({ name, value, color: colors[name] ?? "#a1a1aa" }))
    .sort((a, b) => b.value - a.value);
}

