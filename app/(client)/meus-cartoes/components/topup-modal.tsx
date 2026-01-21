"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Barcode, Landmark, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PaymentMethod = "REFERENCIA_MB" | "TRANSFERENCIA" | "ORDEM_SAQUE";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

export default function TopupModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (amountKz: number, method: PaymentMethod) => Promise<void> | void;
}) {
  const [amountRaw, setAmountRaw] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("TRANSFERENCIA");
  const [isLoading, setIsLoading] = useState(false);

  const amountKz = useMemo(() => Number(amountRaw || "0"), [amountRaw]);
  const canContinue = amountKz > 0 && !isLoading;

  function reset() {
    setAmountRaw("");
    setMethod("TRANSFERENCIA");
    setIsLoading(false);
  }

  async function submit() {
    if (!canContinue) return;
    setIsLoading(true);
    await onConfirm(amountKz, method);
    setIsLoading(false);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[520px] p-0">
        <DialogHeader className="border-b border-zinc-100 px-6 py-5">
          <DialogTitle>Carregar Cartão</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <Label>Valor a carregar (Kz)</Label>
            <Input
              value={amountRaw}
              onChange={(e) => setAmountRaw(digitsOnly(e.target.value).slice(0, 9))}
              placeholder="0"
              inputMode="numeric"
              className="h-14 rounded-2xl bg-zinc-800 text-center text-3xl font-extrabold text-white border-zinc-700 placeholder:text-white/30 focus-visible:ring-white/10"
            />
          </div>

          <div className="space-y-3">
            <Label>Método de Pagamento</Label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMethod("REFERENCIA_MB")}
                className={[
                  "rounded-2xl border p-3 text-center transition",
                  "border-zinc-200 bg-white",
                  method === "REFERENCIA_MB"
                    ? "border-emerald-400 ring-2 ring-emerald-500/20"
                    : "hover:bg-zinc-50",
                ].join(" ")}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                  <Barcode className="h-5 w-5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("TRANSFERENCIA")}
                className={[
                  "rounded-2xl border p-3 text-center transition",
                  "border-zinc-200 bg-white",
                  method === "TRANSFERENCIA"
                    ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/20"
                    : "hover:bg-zinc-50",
                ].join(" ")}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="mt-2 text-xs font-extrabold text-emerald-700">
                  TRANSFER.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("ORDEM_SAQUE")}
                className={[
                  "rounded-2xl border p-3 text-center transition",
                  "border-zinc-200 bg-white",
                  method === "ORDEM_SAQUE"
                    ? "border-emerald-400 ring-2 ring-emerald-500/20"
                    : "hover:bg-zinc-50",
                ].join(" ")}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2 2 7v2h20V7L12 2zm8 9H4v9h16v-9zM6 13h2v5H6v-5zm5 0h2v5h-2v-5zm5 0h2v5h-2v-5z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={submit}
            disabled={!canContinue}
            className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-extrabold hover:bg-emerald-700"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A processar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-3">
                Continuar <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

