"use client";

import { ChevronRight, CreditCard, Lock, Wifi } from "lucide-react";

import type { FrotaCard } from "@/app/(client)/meus-cartoes/lib/mock-cards";

function formatKz(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CardTile({
  card,
  onOpen,
}: {
  card: FrotaCard;
  onOpen: (card: FrotaCard) => void;
}) {
  const isBlocked = Boolean(card.blocked);

  return (
    <button
      type="button"
      onClick={() => {
        onOpen(card);
      }}
      className={[
        "relative w-full text-left rounded-2xl border bg-white p-5 transition-shadow",
        "border-zinc-100/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)]",
        "hover:shadow-[0_6px_26px_rgb(0,0,0,0.03)]",
        isBlocked ? "opacity-70" : "",
      ].join(" ")}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div
          className={[
            "inline-flex h-7 items-center justify-center rounded-md px-2 text-[11px] font-extrabold",
            isBlocked ? "bg-zinc-300 text-zinc-700" : "bg-emerald-600 text-white",
          ].join(" ")}
        >
          F+
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-zinc-300" />
          <div className="relative">
            <div className="h-8 w-14 rounded-lg border border-zinc-100 bg-zinc-50" />
            <CreditCard className="absolute inset-0 m-auto h-4 w-4 text-zinc-200" />
          </div>
        </div>
      </div>

      {/* Card number */}
      <div className="mt-6 flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-zinc-800">
        <span>****</span>
        <span>{card.last4}</span>
      </div>

      {/* Owner */}
      <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
        {card.owner}
      </div>

      <div className="my-4 h-px bg-zinc-100" />

      {/* Bottom row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Saldo Atual
          </div>
          <div className="mt-1 text-base font-extrabold text-zinc-900">
            Kz {formatKz(card.balanceKz)}
          </div>
        </div>

        {isBlocked ? (
          <div className="inline-flex items-center gap-1 rounded-md bg-zinc-500 px-2 py-1 text-[10px] font-bold text-white">
            <Lock className="h-3.5 w-3.5" />
            BLOQUEADO
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(card);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
            aria-label="Ver detalhes do cartão"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </button>
  );
}

