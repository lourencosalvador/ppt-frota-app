"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FileText, X } from "lucide-react";
import { toast } from "sonner";

import type { FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";
import type { SupportStation } from "@/app/(suporte)/suporte/status-postos/lib/mock-support-stations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function SupportRegularizacaoModal({
  open,
  onOpenChange,
  stations,
  defaultFuel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stations: SupportStation[];
  defaultFuel?: FuelType;
  onSubmit: (args: { stationId: string; record: ManualFuelRecord; fuel: FuelType }) => void;
}) {
  const [stationId, setStationId] = useState("");
  const [vehicle, setVehicle] = useState("00-AA-00");
  const [fuel, setFuel] = useState<FuelType>("Diesel");
  const [liters, setLiters] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const litersN = Number(liters);
    const amountN = Number(amount);
    return (
      Boolean(stationId) &&
      Boolean(vehicle.trim()) &&
      Number.isFinite(litersN) &&
      litersN > 0 &&
      Number.isFinite(amountN) &&
      amountN > 0 &&
      justification.trim().length > 0 &&
      !isSubmitting
    );
  }, [stationId, vehicle, liters, amount, justification, isSubmitting]);

  useEffect(() => {
    if (!open) return;
    setStationId(stations[0]?.id ?? "");
    setVehicle("00-AA-00");
    setFuel(defaultFuel ?? "Diesel");
    setLiters("");
    setAmount("");
    setJustification("");
    setIsSubmitting(false);
  }, [open, defaultFuel, stations]);

  async function submit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await sleep(3000);

    const now = new Date();
    const record: ManualFuelRecord = {
      id: crypto?.randomUUID?.() ?? `${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      requester: "Suporte",
      vehicle: vehicle.trim(),
      amountKz: Number(amount),
      liters: Number(liters),
      status: "EM REGULARIZAÇÃO",
    };

    onSubmit({ stationId, record, fuel });
    toast.success("Pedido submetido.");
    setIsSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] overflow-hidden p-0 [&_[data-dialog-close]]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Solicitar Regularização</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden bg-blue-600 px-6 pb-6 pt-7 text-white">
          <div className="text-xl font-extrabold tracking-tight">SOLICITAR REGULARIZAÇÃO</div>
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/80">
            <FileText className="h-4 w-4 text-white/80" />
            FLUXO DE SUPORTE AO CLIENTE
          </div>

          {/* Close (tim-tim do print) */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white/90 hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Watermark (não pode sobrepor o X) */}
          <ClipboardList className="pointer-events-none absolute right-16 top-3 h-20 w-20 text-white/12" />
        </div>

        <div className="px-6 py-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Posto Parceiro
            </Label>
            <Select value={stationId} onValueChange={setStationId}>
              <SelectTrigger className="h-12 rounded-2xl">
                <SelectValue placeholder="Seleccionar Posto..." />
              </SelectTrigger>
              <SelectContent>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                Matrícula
              </Label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(formatMatricula(e.target.value))}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-sm font-semibold"
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
                <SelectTrigger className="h-12 rounded-2xl bg-zinc-50">
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
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                Litros Estimados
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

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
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
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Justificação do Suporte
            </Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva por que o abastecimento manual foi necessário (Ex: Cartão recusado, posto sem comunicação...)"
              className="min-h-[110px] rounded-2xl border-zinc-200 bg-zinc-50 text-sm font-semibold"
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
            className="h-11 w-[260px] rounded-2xl bg-blue-600 px-10 font-extrabold text-white hover:bg-blue-700"
            onClick={submit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A submeter...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                SUBMETER PEDIDO
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

