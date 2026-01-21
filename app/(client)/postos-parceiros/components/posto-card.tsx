"use client";

import { Clock, Fuel, Info, MapPin } from "lucide-react";

import type { PartnerStation } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import { Button } from "@/components/ui/button";

function statusBadge(status: PartnerStation["status"]) {
  if (status === "DISPONIVEL") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

function fuelDot(status: "OK" | "LIMITADO" | "INDISPONIVEL") {
  if (status === "OK") return "bg-emerald-500";
  if (status === "LIMITADO") return "bg-amber-500";
  return "bg-red-500";
}

function fuelText(status: "OK" | "LIMITADO" | "INDISPONIVEL") {
  if (status === "OK") return "text-emerald-600";
  if (status === "LIMITADO") return "text-amber-600";
  return "text-red-600";
}

export default function PostoCard({
  station,
  onOpenDetails,
}: {
  station: PartnerStation;
  onOpenDetails: (station: PartnerStation) => void;
}) {
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
            DISPONÍVEL
          </span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          {station.updatedLabel}
        </div>
      </div>

      <div className="mt-4 text-lg font-extrabold text-zinc-900">
        {station.name}
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-zinc-400">
        <MapPin className="h-4 w-4" />
        {station.city}
      </div>

      <div className="my-4 h-px bg-zinc-100" />

      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
        Disponibilidade de bombas
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
        variant="outline"
        className="mt-5 h-11 w-full rounded-xl border-zinc-200 bg-zinc-50 font-bold text-zinc-600 hover:bg-zinc-100"
        onClick={() => onOpenDetails(station)}
      >
        <Info className="h-4 w-4" />
        Ver Histórico &amp; Detalhes
      </Button>
    </div>
  );
}

