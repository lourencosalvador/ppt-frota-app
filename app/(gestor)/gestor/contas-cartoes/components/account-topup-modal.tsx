"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, X } from "lucide-react";
import { toast } from "sonner";

import type { Account } from "@/app/(gestor)/gestor/contas-cartoes/lib/mock-contas-cartoes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

export default function AccountTopupModal({
  open,
  onOpenChange,
  account,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account: Account | null;
  onConfirm: (amountKz: number) => Promise<void> | void;
}) {
  const [amountRaw, setAmountRaw] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const amountKz = useMemo(() => Number(amountRaw || "0"), [amountRaw]);
  const canContinue = amountKz > 0 && !isLoading;

  function reset() {
    setAmountRaw("");
    setIsLoading(false);
  }

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open]);

  async function submit() {
    if (!canContinue || !account) return;
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    await onConfirm(amountKz);
    toast.success("Carregamento realizado com sucesso.");
    setIsLoading(false);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0">
        <DialogHeader className="border-b border-zinc-100 px-6 py-5">
          <DialogTitle>Carregar Conta</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4">
            <div className="text-sm font-extrabold text-zinc-900">{account?.name ?? "—"}</div>
            <div className="mt-1 text-xs font-semibold text-zinc-500">{account?.accountNumber ?? ""}</div>
          </div>

          <div className="space-y-2">
            <Label>Valor a carregar (KZ)</Label>
            <Input
              value={amountRaw}
              onChange={(e) => setAmountRaw(digitsOnly(e.target.value).slice(0, 10))}
              placeholder="0"
              inputMode="numeric"
              className="h-14 rounded-2xl bg-zinc-800 text-center text-3xl font-extrabold text-white border-zinc-700 placeholder:text-white/30 focus-visible:ring-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-6 py-5">
          <Button type="button" variant="outline" className="h-11 rounded-2xl px-7 font-extrabold" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-11 rounded-2xl bg-blue-600 px-7 font-extrabold hover:bg-blue-700"
            onClick={submit}
            disabled={!canContinue || !account}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A processar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Carregar
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

