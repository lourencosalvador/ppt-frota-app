"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, FileText, Zap } from "lucide-react";

import type { FuelAvailability, FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";
import { toast } from "sonner";

import GestorStationCard from "@/app/(gestor)/gestor/postos-abastec/components/gestor-station-card";
import { supportStationsMock, type SupportStation } from "@/app/(suporte)/suporte/status-postos/lib/mock-support-stations";
import SupportAuditModal from "@/app/(suporte)/suporte/status-postos/components/support-audit-modal";
import SupportRegularizacaoModal from "@/app/(suporte)/suporte/status-postos/components/support-regularizacao-modal";
import { useStations } from "@/app/lib/api/stations-hooks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  if (r < 74) return "OK";
  if (r < 90) return "LIMITADO";
  return "INDISPONIVEL";
}

export default function SuporteStatusPostosClient() {
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("TODOS");
  const [stations, setStations] = useState<SupportStation[]>(supportStationsMock);
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const apiStationsQuery = useStations({ include_inactive: true });

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

  const filtered = useMemo(() => {
    if (fuelFilter === "TODOS") return stations;
    return stations.filter((s) => s.fuels.some((f) => f.fuel === fuelFilter && f.status === "OK"));
  }, [fuelFilter, stations]);

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return stations.find((s) => s.id === selectedStationId) ?? null;
  }, [stations, selectedStationId]);

  function openAudit(station: SupportStation) {
    setSelectedStationId(station.id);
    setAuditOpen(true);
  }

  function updateAuditStatus(args: { stationId: string; recordId: string; status: ManualFuelRecord["status"] }) {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== args.stationId) return s;
        return {
          ...s,
          auditHistory: (s.auditHistory ?? []).map((r) =>
            r.id === args.recordId ? { ...r, status: args.status } : r,
          ),
        };
      }),
    );
  }

  function createManualRecord(args: { createId: string; stationId: string; record: ManualFuelRecord; fuel: FuelType }) {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== args.stationId) return s;
        return {
          ...s,
          updatedLabel: "Agora mesmo",
          auditHistory: [args.record, ...(s.auditHistory ?? [])],
          fuels: s.fuels.map((f) => (f.fuel === args.fuel ? { ...f, status: "OK" } : f)),
        };
      }),
    );
    toast.success("Pedido de regularização enviado.");
  }

  return (
    <div className="w-full">
      <SupportAuditModal
        open={auditOpen}
        onOpenChange={(v) => {
          setAuditOpen(v);
          if (!v) setSelectedStationId(null);
        }}
        stationId={selectedStationId}
        stationName={selectedStation?.name ?? null}
      />

      <SupportRegularizacaoModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        stations={stations}
        defaultFuel={fuelFilter === "TODOS" ? undefined : fuelFilter}
        onSubmit={({ stationId, record, fuel }) =>
          createManualRecord({ createId: crypto?.randomUUID?.() ?? `${Date.now()}`, stationId, record, fuel })
        }
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
              className="h-11 rounded-xl bg-blue-600 px-5 font-extrabold text-white hover:bg-blue-700"
              onClick={() => setManualOpen(true)}
            >
              <FileText className="h-4 w-4" />
              PEDIR REGULARIZAÇÃO MANUAL
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

        {apiStationsQuery.isError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            Falha ao carregar postos. Verifica a API e autenticação.
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {filtered.map((s) => (
            <GestorStationCard
              key={`${s.id}-${s.auditHistory?.length ?? 0}`}
              station={s as any}
              onOpenAudit={openAudit as any}
              ctaLabel="GERIR ABASTECIMENTOS"
              ctaVariant="outline"
              showCount={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

