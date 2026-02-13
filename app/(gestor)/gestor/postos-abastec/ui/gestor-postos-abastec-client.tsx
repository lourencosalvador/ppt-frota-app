"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Fuel, Plus, Zap } from "lucide-react";
import { toast } from "sonner";

import type { FuelAvailability, FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";
import { ApiError } from "@/app/lib/api/api-client";
import GestorAuditModal from "@/app/(gestor)/gestor/postos-abastec/components/gestor-audit-modal";
import GestorManualRefuelModal from "@/app/(gestor)/gestor/postos-abastec/components/gestor-manual-refuel-modal";
import GestorStationCard from "@/app/(gestor)/gestor/postos-abastec/components/gestor-station-card";
import EmptyState from "@/components/ui/empty-state";
import { useStations } from "@/app/lib/api/stations-hooks";
import type { FuelFilter, GestorStation } from "@/app/(gestor)/gestor/postos-abastec/lib/mock-gestor-stations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  if (r < 70) return "OK";
  if (r < 86) return "LIMITADO";
  return "INDISPONIVEL";
}

export default function GestorPostosAbastecClient() {
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("TODOS");
  const apiStationsQuery = useStations({ include_inactive: true });
  const [stations, setStations] = useState<GestorStation[]>([]);
  const processedCreateIds = useRef<Set<string>>(new Set());
  const lastErrorRef = useRef<string | null>(null);

  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    if (!apiStationsQuery.isError) return;
    const err = apiStationsQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar postos.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [apiStationsQuery.error, apiStationsQuery.isError]);

  useEffect(() => {
    if (!apiStationsQuery.data?.length) return;
    setStations((prev) => {
      const prevById = new Map(prev.map((s) => [s.id, s]));
      return apiStationsQuery.data.map((s) => {
        const prevStation = prevById.get(s.id);
        const base = hashSeed(s.id);
        const fuels: FuelAvailability[] =
          prevStation?.fuels ??
          [
            { fuel: "Diesel", status: demoFuelStatus(base + 1) },
            { fuel: "Gasolina 95", status: demoFuelStatus(base + 7) },
            { fuel: "AdBlue", status: demoFuelStatus(base + 13) },
          ];

        return {
          id: s.id,
          name: s.name,
          city: s.city,
          status: s.is_active ? "DISPONIVEL" : "INDISPONIVEL",
          updatedLabel: prevStation?.updatedLabel ?? "Agora mesmo",
          fuels,
          auditHistory: prevStation?.auditHistory ?? [],
        };
      });
    });
  }, [apiStationsQuery.data]);

  const filteredStations = useMemo(() => {
    if (fuelFilter === "TODOS") return stations;
    return stations.filter((s) => s.fuels.some((f) => f.fuel === fuelFilter && f.status === "OK"));
  }, [fuelFilter, stations]);

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return stations.find((s) => s.id === selectedStationId) ?? null;
  }, [stations, selectedStationId]);

  function openAudit(station: GestorStation) {
    setSelectedStationId(station.id);
    setAuditOpen(true);
  }

  function createManualRecord(args: {
    createId: string;
    stationId: string;
    record: ManualFuelRecord;
    fuel: FuelType;
  }) {
    if (processedCreateIds.current.has(args.createId)) return;
    processedCreateIds.current.add(args.createId);

    const baseStation = stations.find((s) => s.id === args.stationId) ?? null;
    const stationName = baseStation?.name ?? "posto";
    const nextCount = (baseStation?.auditHistory?.length ?? 0) + 1;

    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== args.stationId) return s;
        return {
          ...s,
          updatedLabel: "Agora mesmo",
          auditHistory: [args.record, ...(s.auditHistory ?? [])],
          fuels: s.fuels.map((f): FuelAvailability =>
            f.fuel === args.fuel ? { ...f, status: "OK" as const } : f,
          ),
        };
      }),
    );

    toast.success(`Registo criado em ${stationName} (agora ${nextCount} registos).`);
  }

  return (
    <div className="w-full">
      <GestorAuditModal
        open={auditOpen}
        onOpenChange={(v) => {
          setAuditOpen(v);
          if (!v) setSelectedStationId(null);
        }}
        stationId={selectedStationId}
        stationName={selectedStation?.name ?? null}
      />

      <GestorManualRefuelModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        stations={stations}
        defaultStationId={selectedStationId}
        defaultFuel={fuelFilter === "TODOS" ? undefined : fuelFilter}
        onCreate={createManualRecord}
      />

      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-zinc-900">Rede de Postos Pumangol</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                <Zap className="h-3.5 w-3.5" />
                Monitorização Ativa
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Controlo centralizado de abastecimentos manuais e auditoria de rede.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              className="h-11 rounded-xl bg-[#0B1220] px-5 font-extrabold text-white hover:bg-[#101a2e]"
              onClick={() => setManualOpen(true)}
            >
              <Plus className="h-4 w-4" />
              REGISTAR ABASTECIMENTO MANUAL
            </Button>

            <Select value={fuelFilter} onValueChange={(v) => setFuelFilter(v as FuelFilter)}>
              <SelectTrigger className="w-[240px]">
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

        {apiStationsQuery.isLoading ? (
          <div className="mt-5 rounded-2xl border border-zinc-100/60 bg-white p-5 text-sm font-semibold text-zinc-500 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
              A carregar postos...
            </span>
          </div>
        ) : null}

        {!apiStationsQuery.isLoading && filteredStations.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Fuel}
              title="Nenhum posto encontrado"
              description="Os postos da rede vão aparecer aqui assim que estiverem disponíveis na API."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {filteredStations.map((s) => (
              <GestorStationCard
                key={`${s.id}-${s.auditHistory?.length ?? 0}`}
                station={s}
                onOpenAudit={openAudit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
