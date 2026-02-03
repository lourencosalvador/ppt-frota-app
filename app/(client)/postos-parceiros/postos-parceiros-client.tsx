"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Fuel, Zap } from "lucide-react";
import { toast } from "sonner";

import PostoCard from "@/app/(client)/postos-parceiros/components/posto-card";
import type {
  FuelAvailability,
  FuelType,
  PartnerStation,
} from "@/app/(client)/postos-parceiros/lib/mock-stations";
import StationHistoryModal from "@/app/(client)/postos-parceiros/components/station-history-modal";
import { ApiError } from "@/app/lib/api/api-client";
import { useStations } from "@/app/lib/api/stations-hooks";
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

export default function PostosParceirosClient() {
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("TODOS");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    if (fuelFilter === "TODOS") return stations;
    return stations.filter((s) =>
      s.fuels.some((f) => f.fuel === fuelFilter && f.status === "OK"),
    );
  }, [fuelFilter, stations]);

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return stations.find((s) => s.id === selectedStationId) ?? null;
  }, [selectedStationId, stations]);

  return (
    <div className="w-full">
      <StationHistoryModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setSelectedStationId(null);
        }}
        station={selectedStation}
      />

      <div className="mx-auto w-full max-w-[1120px]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-zinc-900">
                Rede de Postos Parceiros
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                <Zap className="h-3.5 w-3.5" />
                AO VIVO
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Consulta de disponibilidade de combustível em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={fuelFilter} onValueChange={(v) => setFuelFilter(v as FuelFilter)}>
              <SelectTrigger className="w-[280px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-zinc-500" />
                  <SelectValue className="truncate" placeholder="Todos os Combustíveis" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Combustíveis</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Gasolina 95">Gasolina 95</SelectItem>
                <SelectItem value="AdBlue">AdBlue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {stationsQuery.isLoading ? (
          <div className="mt-5 rounded-2xl border border-zinc-100/60 bg-white p-5 text-sm font-semibold text-zinc-500 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
              A carregar postos...
            </span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {filtered.map((s) => (
            <PostoCard
              key={s.id}
              station={s}
              onOpenDetails={(st) => {
                setSelectedStationId(st.id);
                setModalOpen(true);
              }}
            />
          ))}

          {!stationsQuery.isLoading && filtered.length === 0 ? (
            <div className="lg:col-span-3">
              <EmptyState
                icon={Fuel}
                title="Nenhum posto encontrado"
                description="Não encontramos postos para o filtro selecionado. Ajusta o combustível ou tenta novamente mais tarde."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

