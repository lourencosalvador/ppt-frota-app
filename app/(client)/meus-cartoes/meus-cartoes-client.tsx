"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CreditCard } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import CardTile from "@/app/(client)/meus-cartoes/components/card-tile";
import CardDetailsView from "@/app/(client)/meus-cartoes/components/card-details-view";
import CardLimitsModal from "@/app/(client)/meus-cartoes/components/card-limits-modal";
import TopupModal, {
} from "@/app/(client)/meus-cartoes/components/topup-modal";
import BalanceAlertModal from "@/app/(client)/meus-cartoes/components/balance-alert-modal";
import type { FrotaCard } from "@/app/(client)/meus-cartoes/lib/mock-cards";
import { ApiError } from "@/app/lib/api/api-client";
import { useCards, useUpdateCardLimits } from "@/app/lib/api/cards-hooks";
import EmptyState from "@/components/ui/empty-state";

export default function MeusCartoesClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);

  const [balanceDeltaById, setBalanceDeltaById] = useState<Record<string, number>>({});
  const [transactionsById, setTransactionsById] = useState<Record<string, FrotaCard["transactions"]>>(
    {},
  );
  const [alertLimitById, setAlertLimitById] = useState<Record<string, number>>({});

  const cardsQuery = useCards();
  const updateLimits = useUpdateCardLimits();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cardsQuery.isError) return;
    const err = cardsQuery.error;
    const message =
      err instanceof ApiError ? err.message : "Falha ao carregar cartões.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [cardsQuery.error, cardsQuery.isError]);

  function parseKz(raw: string) {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) return 0;
    const cleaned = trimmed.replace(/[^\d.,-]/g, "");
    if (!cleaned) return 0;
    const both = cleaned.includes(".") && cleaned.includes(",");
    const normalized = both ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function formatExpiry(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "--/--";
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yy = String(d.getUTCFullYear()).slice(-2);
    return `${mm}/${yy}`;
  }

  const cards = useMemo<FrotaCard[]>(() => {
    const delta = balanceDeltaById;
    const tx = transactionsById;
    const alert = alertLimitById;

    if (!cardsQuery.data?.length) return [];

    return cardsQuery.data.map((c) => {
      const amount = parseKz(c.amount);
      const baseBalance = parseKz(c.current_balance);
      const balanceKz = baseBalance + (delta[c.id] ?? 0);
      const usagePercent =
        amount > 0 ? Math.round(((amount - baseBalance) / amount) * 100) : 0;

      const lastSource = (c.uid || c.id).replace(/-/g, "");
      const last4 = lastSource.slice(-4).padStart(4, "0");

      return {
        id: c.id,
        last4,
        owner: c.company_name,
        balanceKz,
        blocked: c.status !== "active",
        validThru: formatExpiry(c.expires_at),
        dailyLimitKz: parseKz(c.daily_limit),
        monthlyLimitKz: parseKz(c.monthly_limit),
        minLimitKz: alert[c.id] ?? 20_000,
        usagePercent: Math.min(100, Math.max(0, usagePercent)),
        transactions: tx[c.id] ?? [],
      };
    });
  }, [alertLimitById, balanceDeltaById, cardsQuery.data, transactionsById]);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedId) ?? null,
    [selectedId, cards],
  );

  return (
    <div className="w-full">
      <TopupModal
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onConfirm={async (amountKz: number) => {
          await new Promise<void>((r) => setTimeout(r, 1600));
          if (!selectedId) return;
          setBalanceDeltaById((prev) => ({ ...prev, [selectedId]: (prev[selectedId] ?? 0) + amountKz }));
          setTransactionsById((prev) => ({
            ...prev,
            [selectedId]: [
              {
                id: crypto.randomUUID(),
                title: "Recarga",
                date: new Date().toISOString().slice(0, 10),
                amountKz,
              },
              ...(prev[selectedId] ?? selectedCard?.transactions ?? []),
            ],
          }));
          toast.success("Carregamento realizado com sucesso.");
        }}
      />

      <BalanceAlertModal
        open={alertOpen}
        onOpenChange={setAlertOpen}
        initialLimitKz={selectedCard?.minLimitKz ?? 0}
        onSave={async (limitKz: number) => {
          await new Promise<void>((r) => setTimeout(r, 1200));
          if (!selectedId) return;
          setAlertLimitById((prev) => ({ ...prev, [selectedId]: limitKz }));
          toast.success("Limite guardado com sucesso.");
        }}
      />

      <CardLimitsModal
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        initialDailyLimitKz={selectedCard?.dailyLimitKz ?? null}
        initialMonthlyLimitKz={selectedCard?.monthlyLimitKz ?? null}
        onSave={async ({ dailyLimitKz, monthlyLimitKz }) => {
          if (!selectedId) return;
          try {
            const body: { daily_limit?: string; monthly_limit?: string } = {};
            if (typeof dailyLimitKz === "number") body.daily_limit = String(dailyLimitKz);
            if (typeof monthlyLimitKz === "number") body.monthly_limit = String(monthlyLimitKz);
            await updateLimits.mutateAsync({ cardId: selectedId, body });
            toast.success("Limites atualizados com sucesso.");
          } catch (e) {
            // let the modal surface field errors when possible
            if (e instanceof ApiError) throw e;
            throw e;
          }
        }}
      />

      <AnimatePresence mode="wait">
        {selectedCard ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
          >
            <CardDetailsView
              card={selectedCard}
              onBack={() => setSelectedId(null)}
              onTopup={() => setTopupOpen(true)}
              onAlert={() => setAlertOpen(true)}
              onLimits={() => setLimitsOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
            className="mx-auto w-full max-w-[1120px]"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900">
                  Cartões Disponíveis
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                  Selecione um cartão para ver detalhes, transações e gerir saldo.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Briefcase className="h-4 w-4" />
                Frota da Empresa
              </div>
            </div>

            {cardsQuery.isLoading ? (
              <div className="mt-5 rounded-2xl border border-zinc-100/60 bg-white p-5 text-sm font-semibold text-zinc-500 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
                  A carregar cartões...
                </span>
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <CardTile key={c.id} card={c} onOpen={() => setSelectedId(c.id)} />
              ))}
            </div>

            {!cardsQuery.isLoading && cards.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={CreditCard}
                  title="Sem cartões disponíveis"
                  description="Ainda não existem cartões associados à tua empresa. Quando houver cartões, eles vão aparecer aqui automaticamente."
                />
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

