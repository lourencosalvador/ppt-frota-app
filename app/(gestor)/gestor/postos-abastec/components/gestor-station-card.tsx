"use client";

import { Eye, Fuel, MapPin } from "lucide-react";

import type { GestorStation } from "@/app/(gestor)/gestor/postos-abastec/lib/mock-gestor-stations";
import { Button } from "@/components/ui/button";

function statusBadge(status: GestorStation["status"]) {
  if (status === "DISPONIVEL") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

function fuelDot(status: GestorStation["fuels"][number]["status"]) {
  if (status === "OK") return "bg-emerald-500";
  if (status === "LIMITADO") return "bg-amber-500";
  return "bg-red-500";
}

function fuelText(status: GestorStation["fuels"][number]["status"]) {
  if (status === "OK") return "text-emerald-600";
  if (status === "LIMITADO") return "text-amber-600";
  return "text-red-600";
}

export default function GestorStationCard({
  station,
  onOpenAudit,
  ctaLabel = "MÓDULO DE AUDITORIA",
  ctaVariant = "solid",
  showCount = true,
}: {
  station: GestorStation;
  onOpenAudit: (station: GestorStation) => void;
  ctaLabel?: string;
  ctaVariant?: "solid" | "outline";
  showCount?: boolean;
}) {
  const auditCount = station.auditHistory?.length ?? 0;

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Fuel className="h-5 w-5" />
          </div>
          <span
            className={[
              "inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest",
              statusBadge(station.status),
            ].join(" ")}
          >
            {station.status === "DISPONIVEL" ? "DISPONÍVEL" : "INDISPONÍVEL"}
          </span>
        </div>

        {showCount ? (
          <div className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
            {auditCount} registos
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-lg font-extrabold text-zinc-900">{station.name}</div>
      <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-zinc-400">
        <MapPin className="h-4 w-4" />
        {station.city}
      </div>

      <div className="my-4 h-px bg-zinc-100" />

      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
        Stocks disponíveis
      </div>

      <div className="mt-3 space-y-2">
        {station.fuels.map((f) => (
          <div key={f.fuel} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
              <span className={`h-2 w-2 rounded-full ${fuelDot(f.status)}`} />
              {f.fuel}
            </div>
            <div
              className={[
                "text-xs font-extrabold uppercase tracking-widest",
                fuelText(f.status),
              ].join(" ")}
            >
              {f.status}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant={ctaVariant === "outline" ? "outline" : "default"}
        className={[
          "mt-5 h-11 w-full rounded-xl font-extrabold",
          ctaVariant === "outline"
            ? "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
            : "bg-[#0B1220] text-white hover:bg-[#101a2e]",
        ].join(" ")}
        onClick={() => onOpenAudit(station)}
      >
        <Eye className="h-4 w-4" />
        {ctaLabel}
      </Button>
    </div>
  );
}

