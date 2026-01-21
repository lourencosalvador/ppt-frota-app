"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import CardTile from "@/app/(client)/meus-cartoes/components/card-tile";
import CardDetailsView from "@/app/(client)/meus-cartoes/components/card-details-view";
import TopupModal, {
  type PaymentMethod,
} from "@/app/(client)/meus-cartoes/components/topup-modal";
import BalanceAlertModal from "@/app/(client)/meus-cartoes/components/balance-alert-modal";
import { mockCards, type FrotaCard } from "@/app/(client)/meus-cartoes/lib/mock-cards";

export default function MeusCartoesClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<FrotaCard[]>(mockCards);
  const [topupOpen, setTopupOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedId) ?? null,
    [selectedId, cards],
  );

  return (
    <div className="w-full">
      <TopupModal
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onConfirm={async (amountKz: number, _method: PaymentMethod) => {
          await new Promise<void>((r) => setTimeout(r, 1600));
          if (!selectedId) return;
          setCards((prev) =>
            prev.map((c) => {
              if (c.id !== selectedId) return c;
              return {
                ...c,
                balanceKz: c.balanceKz + amountKz,
                transactions: [
                  {
                    id: crypto.randomUUID(),
                    title: "Recarga",
                    date: new Date().toISOString().slice(0, 10),
                    amountKz,
                  },
                  ...c.transactions,
                ],
              };
            }),
          );
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
          setCards((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, minLimitKz: limitKz } : c)),
          );
          toast.success("Limite guardado com sucesso.");
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

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <CardTile key={c.id} card={c} onOpen={() => setSelectedId(c.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

