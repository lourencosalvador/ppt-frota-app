"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Account, AccountStatus } from "@/app/(gestor)/gestor/contas-cartoes/lib/mock-contas-cartoes";
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

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

function formatAccount(raw: string) {
  // PT50 + 16 dígitos no visual (mock)
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = cleaned.startsWith("PT") ? "PT" : "PT";
  const rest = cleaned.replace(/^PT/i, "").slice(0, 18);
  const grouped = rest.match(/.{1,4}/g)?.join(" ") ?? rest;
  return `${prefix}${grouped ? ` ${grouped}` : ""}`.trim();
}

export default function CreateAccountModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (acc: Account) => void;
}) {
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("PT50 0000 0000 0000 0000 0");
  const [activeCards, setActiveCards] = useState("0");
  const [balance, setBalance] = useState("0");
  const [status, setStatus] = useState<AccountStatus>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const cards = Number(activeCards);
    const bal = Number(balance);
    return name.trim().length > 2 && accountNumber.trim().length > 6 && Number.isFinite(cards) && Number.isFinite(bal) && !isSubmitting;
  }, [name, accountNumber, activeCards, balance, isSubmitting]);

  function reset() {
    setName("");
    setAccountNumber("PT50 0000 0000 0000 0000 0");
    setActiveCards("0");
    setBalance("0");
    setStatus("ACTIVE");
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (!open) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise<void>((r) => setTimeout(r, 800));

    const newAcc: Account = {
      id: crypto?.randomUUID?.() ?? `${Date.now()}`,
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      activeCards: Math.max(0, Number(activeCards) || 0),
      status,
      balanceKz: Math.max(0, Number(balance) || 0),
    };
    onCreate(newAcc);
    toast.success("Conta criada.");
    setIsSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0">
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Frota Norte Distribuição Lda" />
          </div>

          <div className="space-y-2">
            <Label>Conta / IBAN</Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(formatAccount(e.target.value))}
              placeholder="PT50 0000 0000 0000 1234 5"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cartões Ativos</Label>
              <Input
                value={activeCards}
                onChange={(e) => setActiveCards(digitsOnly(e.target.value).slice(0, 3))}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Saldo Inicial (KZ)</Label>
              <Input
                value={balance}
                onChange={(e) => setBalance(digitsOnly(e.target.value).slice(0, 10))}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-6 py-5">
          <Button type="button" variant="outline" className="h-11 rounded-2xl px-7 font-extrabold" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" className="h-11 rounded-2xl bg-emerald-600 px-7 font-extrabold hover:bg-emerald-700" onClick={submit} disabled={!canSubmit}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Criando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

