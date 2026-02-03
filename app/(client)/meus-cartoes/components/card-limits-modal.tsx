"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

export default function CardLimitsModal({
  open,
  onOpenChange,
  initialDailyLimitKz,
  initialMonthlyLimitKz,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialDailyLimitKz: number | null;
  initialMonthlyLimitKz: number | null;
  onSave: (args: { dailyLimitKz?: number; monthlyLimitKz?: number }) => Promise<void> | void;
}) {
  const [dailyRaw, setDailyRaw] = useState(initialDailyLimitKz ? String(initialDailyLimitKz) : "");
  const [monthlyRaw, setMonthlyRaw] = useState(initialMonthlyLimitKz ? String(initialMonthlyLimitKz) : "");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ daily?: string; monthly?: string }>({});

  useEffect(() => {
    if (!open) return;
    setDailyRaw(initialDailyLimitKz ? String(initialDailyLimitKz) : "");
    setMonthlyRaw(initialMonthlyLimitKz ? String(initialMonthlyLimitKz) : "");
    setFieldErrors({});
    setIsLoading(false);
  }, [open, initialDailyLimitKz, initialMonthlyLimitKz]);

  const dailyLimitKz = useMemo(() => Number(dailyRaw || "0"), [dailyRaw]);
  const monthlyLimitKz = useMemo(() => Number(monthlyRaw || "0"), [monthlyRaw]);

  const payload = useMemo(() => {
    const body: { dailyLimitKz?: number; monthlyLimitKz?: number } = {};
    if (dailyRaw.trim().length) body.dailyLimitKz = dailyLimitKz;
    if (monthlyRaw.trim().length) body.monthlyLimitKz = monthlyLimitKz;
    return body;
  }, [dailyRaw, monthlyRaw, dailyLimitKz, monthlyLimitKz]);

  const canSave = !isLoading && (payload.dailyLimitKz || payload.monthlyLimitKz);

  async function submit() {
    if (!canSave) {
      toast.error("Envia pelo menos um limite (diário ou mensal).");
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      await onSave(payload);
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError) {
        const daily = e.body?.errors?.daily_limit?.[0];
        const monthly = e.body?.errors?.monthly_limit?.[0];
        if (daily || monthly) setFieldErrors({ daily, monthly });
        toast.error(e.message);
      } else {
        toast.error("Falha ao atualizar limites.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader className="pr-12">
          <DialogTitle className="inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            Definir Limites do Cartão
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Limite diário (Kz)</Label>
            <Input
              value={dailyRaw}
              onChange={(e) => setDailyRaw(digitsOnly(e.target.value).slice(0, 11))}
              inputMode="numeric"
              placeholder="Ex: 50000"
              className={[
                "h-12 rounded-2xl",
                fieldErrors.daily ? "border-red-300 focus-visible:ring-red-500/20" : "",
              ].join(" ")}
            />
            {fieldErrors.daily ? (
              <div className="text-xs font-semibold text-red-600">{fieldErrors.daily}</div>
            ) : (
              <div className="text-xs font-semibold text-zinc-400">Opcional.</div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Limite mensal (Kz)</Label>
            <Input
              value={monthlyRaw}
              onChange={(e) => setMonthlyRaw(digitsOnly(e.target.value).slice(0, 11))}
              inputMode="numeric"
              placeholder="Ex: 500000"
              className={[
                "h-12 rounded-2xl",
                fieldErrors.monthly ? "border-red-300 focus-visible:ring-red-500/20" : "",
              ].join(" ")}
            />
            {fieldErrors.monthly ? (
              <div className="text-xs font-semibold text-red-600">{fieldErrors.monthly}</div>
            ) : (
              <div className="text-xs font-semibold text-zinc-400">Opcional.</div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 hover:text-zinc-600"
            disabled={isLoading}
          >
            Cancelar
          </button>

          <Button
            type="button"
            onClick={submit}
            disabled={!canSave}
            className="h-12 rounded-2xl bg-emerald-600 px-8 font-extrabold hover:bg-emerald-700"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A guardar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

