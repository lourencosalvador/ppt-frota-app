"use client";

import { useMemo, useState } from "react";
import { Filter, Zap } from "lucide-react";

import PostoCard from "@/app/(client)/postos-parceiros/components/posto-card";
import { mockStations, type FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import StationHistoryModal from "@/app/(client)/postos-parceiros/components/station-history-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FuelFilter = "TODOS" | FuelType;

export default function PostosParceirosClient() {
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("TODOS");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (fuelFilter === "TODOS") return mockStations;
    return mockStations.filter((s) =>
      s.fuels.some((f) => f.fuel === fuelFilter && f.status === "OK"),
    );
  }, [fuelFilter]);

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return mockStations.find((s) => s.id === selectedStationId) ?? null;
  }, [selectedStationId]);

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
        </div>
      </div>
    </div>
  );
}

