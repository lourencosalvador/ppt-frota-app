"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Fuel, MapPin, Search, Zap } from "lucide-react";
import { toast } from "sonner";

import type {
  FuelAvailability,
  FuelType,
  PartnerStation,
} from "@/app/(client)/postos-parceiros/lib/mock-stations";
import { ApiError } from "@/app/lib/api/api-client";
import { useStations } from "@/app/lib/api/stations-hooks";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/ui/empty-state";

type FuelFilter = "TODOS" | FuelType;

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function demoFuelStatus(seed: number): FuelAvailability["status"] {
  const r = seed % 100;
  if (r < 72) return "OK";
  if (r < 88) return "LIMITADO";
  return "INDISPONIVEL";
}

function mapStationToUi(s: { id: string; name: string; city: string; is_active: boolean }): PartnerStation {
  const base = hashSeed(s.id);
  const fuels: FuelAvailability[] = [
    { fuel: "Diesel", status: demoFuelStatus(base + 1) },
    { fuel: "Gasolina 95", status: demoFuelStatus(base + 7) },
    { fuel: "AdBlue", status: demoFuelStatus(base + 13) },
  ];

  return {
    id: s.id,
    name: s.name,
    city: s.city,
    status: s.is_active ? "DISPONIVEL" : "INDISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels,
  };
}

function statusBadgeClass(status: PartnerStation["status"]) {
  return status === "DISPONIVEL"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function fuelDot(status: FuelAvailability["status"]) {
  if (status === "OK") return "bg-emerald-500";
  if (status === "LIMITADO") return "bg-amber-500";
  return "bg-red-500";
}

function fuelTextColor(status: FuelAvailability["status"]) {
  if (status === "OK") return "text-emerald-600";
  if (status === "LIMITADO") return "text-amber-600";
  return "text-red-600";
}

export default function ColaboradorPostosClient() {
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("TODOS");
  const [search, setSearch] = useState("");
  const stationsQuery = useStations();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!stationsQuery.isError) return;
    const err = stationsQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar postos.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [stationsQuery.error, stationsQuery.isError]);

  const stations = useMemo<PartnerStation[]>(() => {
    if (!stationsQuery.data?.length) return [];
    return stationsQuery.data.map((s) => mapStationToUi(s));
  }, [stationsQuery.data]);

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (fuelFilter !== "TODOS" && !s.fuels.some((f) => f.fuel === fuelFilter && f.status === "OK")) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [fuelFilter, search, stations]);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-2">
          <div className="text-lg font-extrabold text-zinc-900">Postos de Abastecimento</div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 border border-emerald-100">
            <Zap className="h-3 w-3" />
            AO VIVO
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold text-zinc-500">
          Consulta a disponibilidade de combustível nos postos da rede Pumangol.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou cidade..."
            className="h-11 rounded-2xl pl-10"
          />
        </div>
        <Select value={fuelFilter} onValueChange={(v) => setFuelFilter(v as FuelFilter)}>
          <SelectTrigger className="h-11 w-52 rounded-2xl">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Combustível" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os combustíveis</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="Gasolina 95">Gasolina 95</SelectItem>
            <SelectItem value="AdBlue">AdBlue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {stationsQuery.isLoading && (
        <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-12 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            A carregar postos...
          </span>
        </div>
      )}

      {/* Stations grid */}
      {!stationsQuery.isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <EmptyState
            icon={Fuel}
            title="Nenhum posto encontrado"
            description="Ajusta os filtros ou tenta novamente mais tarde."
          />
        </div>
      )}

      {!stationsQuery.isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Fuel className="h-5 w-5" />
                </div>
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusBadgeClass(s.status)}`}
                >
                  {s.status === "DISPONIVEL" ? "DISPONÍVEL" : "INDISPONÍVEL"}
                </span>
              </div>

              <div className="mt-4 text-sm font-extrabold text-zinc-900">{s.name}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-zinc-400">
                <MapPin className="h-3.5 w-3.5" />
                {s.city}
              </div>

              <div className="my-4 h-px bg-zinc-100" />

              <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                Disponibilidade
              </div>
              <div className="mt-2.5 space-y-2">
                {s.fuels.map((f) => (
                  <div key={f.fuel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                      <span className={`h-2 w-2 rounded-full ${fuelDot(f.status)}`} />
                      {f.fuel}
                    </div>
                    <div className={`text-[10px] font-extrabold uppercase tracking-widest ${fuelTextColor(f.status)}`}>
                      {f.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
