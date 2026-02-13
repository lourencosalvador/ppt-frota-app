"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

export default function BalanceAlertModal({
  open,
  onOpenChange,
  initialLimitKz,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialLimitKz: number;
  onSave: (limitKz: number) => Promise<void> | void;
}) {
  const [valueRaw, setValueRaw] = useState(String(initialLimitKz));
  const [isLoading, setIsLoading] = useState(false);

  const limitKz = useMemo(() => Number(valueRaw || "0"), [valueRaw]);
  const canSave = limitKz > 0 && !isLoading;

  function reset() {
    setValueRaw(String(initialLimitKz));
    setIsLoading(false);
  }

  async function submit() {
    if (!canSave) {
      toast.error("Define um limite válido.");
      return;
    }
    setIsLoading(true);
    await onSave(limitKz);
    setIsLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[520px] overflow-hidden p-0">
        <div className="relative bg-gradient-to-b from-[#0B1220] to-[#0E2236] px-6 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Bell className="h-8 w-8" />
          </div>
          <DialogHeader className="border-0 px-0 py-0">
            <DialogTitle className="mt-6 text-2xl font-extrabold tracking-wide text-white">
              ALERTA DE SALDO
            </DialogTitle>
          </DialogHeader>
          <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-white/45">
            Defina o limite mínimo para receber notificações de carregamento.
          </p>
        </div>

        <div className="space-y-5 bg-white px-6 py-8">
          <div className="text-center text-[12px] font-extrabold uppercase tracking-[0.22em] text-zinc-400">
            LIMITE DESEJADO (KZ)
          </div>

          <div className="flex justify-center">
            <Input
              value={valueRaw}
              onChange={(e) => setValueRaw(digitsOnly(e.target.value).slice(0, 9))}
              inputMode="numeric"
              className="h-16 w-[220px] rounded-2xl border-2 border-blue-200 bg-blue-50 text-center text-4xl font-extrabold text-zinc-900 shadow-sm focus-visible:ring-0"
            />
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm font-bold text-blue-700">
              O SISTEMA ENVIARÁ UM AVISO VISUAL ASSIM QUE O SEU SALDO FOR INFERIOR OU IGUAL A ESTE VALOR.
            </div>
          </div>
        </div>

        <DialogFooter className="border-0 bg-white px-6 pb-8 pt-0">
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
            className="h-12 rounded-2xl bg-[#0B1220] px-8 font-extrabold hover:bg-[#0E2236]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A guardar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                GUARDAR LIMITE
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

