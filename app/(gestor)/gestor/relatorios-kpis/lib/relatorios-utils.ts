import type { FuelEvent, ReportsRange, TopVehicleRow } from "@/app/(gestor)/gestor/relatorios-kpis/lib/mock-relatorios-kpis";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

function addDaysUTC(d: Date, days: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days, 12, 0, 0));
}

function parseISO(dateISO: string) {
  const m = dateISO.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (!y || !mo || !da) return null;
  const d = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function applyRange(events: FuelEvent[], range: ReportsRange, now: Date) {
  const today = startOfDayUTC(now);
  let from: Date;
  let to: Date;

  if (range === "TODAY") {
    from = today;
    to = addDaysUTC(today, 1);
  } else if (range === "LAST_7") {
    from = addDaysUTC(today, -6);
    to = addDaysUTC(today, 1);
  } else {
    from = addDaysUTC(today, -29);
    to = addDaysUTC(today, 1);
  }

  return events.filter((e) => {
    const d = parseISO(e.dateISO);
    if (!d) return false;
    return d >= from && d < to;
  });
}

export function topVehiclesFromEvents(events: FuelEvent[]) {
  const byPlate = new Map<string, { liters: number; costKz: number }>();
  for (const e of events) {
    const prev = byPlate.get(e.matricula) ?? { liters: 0, costKz: 0 };
    byPlate.set(e.matricula, { liters: prev.liters + e.liters, costKz: prev.costKz + e.costKz });
  }

  const rows: TopVehicleRow[] = Array.from(byPlate.entries()).map(([matricula, agg]) => {
    const efficiency: TopVehicleRow["efficiency"] = agg.costKz >= 400 ? "ALTO_CUSTO" : "EFICIENTE";
    return { matricula, liters: Number(agg.liters.toFixed(1)), costKz: Number(agg.costKz.toFixed(2)), efficiency };
  });

  return rows.sort((a, b) => b.liters - a.liters).slice(0, 4);
}

export function averageCostPerVehicleKz(events: FuelEvent[]) {
  const totals = new Map<string, number>();
  for (const e of events) totals.set(e.matricula, (totals.get(e.matricula) ?? 0) + e.costKz);
  const values = Array.from(totals.values());
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

