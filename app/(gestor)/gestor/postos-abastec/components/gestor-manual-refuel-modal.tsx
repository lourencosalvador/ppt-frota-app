"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Fuel, Shield } from "lucide-react";
import { toast } from "sonner";

import type { FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord, ManualFuelStatus } from "@/app/(client)/postos-parceiros/lib/mock-history";
import type { GestorStation } from "@/app/(gestor)/gestor/postos-abastec/lib/mock-gestor-stations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function formatMatricula(raw: string) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const parts = cleaned.match(/.{1,2}/g) ?? [];
  return parts.join("-");
}

function pad2(v: number) {
  return String(v).padStart(2, "0");
}

function toPtDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function toTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fieldCard(color: "mint" | "blue") {
  if (color === "mint") return "border-emerald-100 bg-emerald-50/45";
  return "border-blue-100 bg-blue-50/45";
}

export default function GestorManualRefuelModal({
  open,
  onOpenChange,
  stations,
  defaultStationId,
  defaultFuel,
  recordStatus = "ABERTO",
  requesterLabel = "Gestor",
  actionLabel = "VALIDAR E REGISTAR",
  triggerTitle = "REGISTO DE AUDITORIA",
  triggerSubtitle = "ABASTECIMENTO MANUAL",
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stations: GestorStation[];
  defaultStationId?: string | null;
  defaultFuel?: FuelType;
  recordStatus?: ManualFuelStatus;
  requesterLabel?: string;
  actionLabel?: string;
  triggerTitle?: string;
  triggerSubtitle?: string;
  onCreate: (args: { createId: string; stationId: string; record: ManualFuelRecord; fuel: FuelType }) => void;
}) {
  const [stationId, setStationId] = useState<string>("");
  const [vehicle, setVehicle] = useState("00-AA-00");
  const [fuel, setFuel] = useState<FuelType>("Diesel");
  const [liters, setLiters] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Se o modal foi aberto sem um posto "origem" (botão do topo),
    // forçamos o utilizador a escolher explicitamente para evitar registar no posto errado.
    setStationId(defaultStationId ?? "");
    setVehicle("00-AA-00");
    setFuel(defaultFuel ?? "Diesel");
    setLiters("");
    setAmount("");
    setJustification("");
    setIsSubmitting(false);
  }, [open, defaultStationId, stations, defaultFuel]);

  const station = useMemo(
    () => stations.find((s) => s.id === stationId) ?? null,
    [stations, stationId],
  );

  async function submit() {
    if (isSubmitting) return;
    if (!stationId) {
      toast.error("Selecione o posto de abastecimento.");
      return;
    }
    if (!vehicle.trim()) {
      toast.error("Informe a matrícula.");
      return;
    }
    const litersN = Number(liters);
    const amountN = Number(amount);
    if (!Number.isFinite(litersN) || litersN <= 0) {
      toast.error("Informe os litros.");
      return;
    }
    if (!Number.isFinite(amountN) || amountN <= 0) {
      toast.error("Informe o valor.");
      return;
    }
    if (!justification.trim()) {
      toast.error("Informe a justificativa de auditoria.");
      return;
    }

    setIsSubmitting(true);
    await sleep(3000);

    const now = new Date();
    const record: ManualFuelRecord = {
      id: crypto?.randomUUID?.() ?? `${Date.now()}`,
      date: toPtDate(now),
      time: toTime(now),
      requester: requesterLabel,
      vehicle: vehicle.trim(),
      amountKz: amountN,
      liters: litersN,
      status: recordStatus,
    };

    const createId = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    onCreate({ createId, stationId, record, fuel });
    setIsSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] overflow-hidden p-0 lg:left-[calc(50%+132px)]">
        <div className="relative overflow-hidden bg-[#0B1220] px-6 pb-6 pt-7 text-white">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <Fuel className="h-5 w-5 text-white/90" />
            {triggerTitle}
          </div>
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-zinc-200/90">
            <Shield className="h-4 w-4 text-amber-200/90" />
            {triggerSubtitle}
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Posto de Abastecimento
            </Label>
            <Select value={stationId} onValueChange={setStationId}>
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="Seleccionar Posto..." />
              </SelectTrigger>
              <SelectContent>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {station ? (
              <div className="text-xs font-semibold text-zinc-400">
                {station.name} • {station.city}
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                Matrícula
              </Label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(formatMatricula(e.target.value))}
                className="h-12 rounded-2xl border-zinc-200 bg-white text-sm font-semibold"
                placeholder="00-AA-00"
                inputMode="text"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                Combustível
              </Label>
              <Select value={fuel} onValueChange={(v) => setFuel(v as FuelType)}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue placeholder="Diesel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Gasolina 95">Gasolina 95</SelectItem>
                  <SelectItem value="AdBlue">AdBlue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className={`rounded-2xl border p-5 ${fieldCard("mint")}`}>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                Litros
              </div>
              <Input
                inputMode="decimal"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="0"
                className="mt-3 h-12 rounded-2xl border-zinc-200 bg-white text-sm font-semibold"
                disabled={isSubmitting}
              />
            </div>

            <div className={`rounded-2xl border p-5 ${fieldCard("blue")}`}>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                Valor (€)
              </div>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-3 h-12 rounded-2xl border-zinc-200 bg-white text-sm font-semibold"
                disabled={isSubmitting}
              />
              <div className="mt-2 text-[11px] font-semibold text-zinc-400">
                (O sistema guarda como KZ no mock)
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Justificativa de Auditoria
            </Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Motivo do registo manual..."
              className="min-h-[110px] rounded-2xl border-zinc-200 bg-white text-sm font-semibold"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-1">
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-2xl px-7 font-extrabold text-zinc-500 hover:text-zinc-700"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            CANCELAR
          </Button>

          <Button
            type="button"
            className="h-11 rounded-2xl bg-[#0B1220] px-10 font-extrabold text-white hover:bg-[#101a2e]"
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Registrando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                {actionLabel}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

