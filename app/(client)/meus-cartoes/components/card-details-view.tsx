"use client";

import {
  ArrowLeft,
  Bell,
  Cog,
  Download,
  Lock,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";

import type { FrotaCard } from "@/app/(client)/meus-cartoes/lib/mock-cards";
import { Button } from "@/components/ui/button";

function formatKz(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function maskCard(last4: string) {
  return `**** **** **** ${last4}`;
}

export default function CardDetailsView({
  card,
  onBack,
  onTopup,
  onAlert,
}: {
  card: FrotaCard;
  onBack: () => void;
  onTopup: () => void;
  onAlert: () => void;
}) {
  const isBlocked = Boolean(card.blocked);

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista de cartões
      </button>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_520px]">
        {/* Left column */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-zinc-900">
              Detalhes do Cartão
            </h1>
            <div className="flex items-center gap-3">
              {isBlocked ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">
                  <Lock className="h-4 w-4" />
                  BLOQUEADO
                </span>
              ) : null}
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-white hover:text-zinc-600"
                aria-label="Definições"
              >
                <Cog className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Card visual */}
          <div
            className={[
              "mt-4 rounded-2xl p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.18)]",
              isBlocked
                ? "bg-gradient-to-br from-zinc-500 via-zinc-600 to-zinc-700"
                : "bg-gradient-to-br from-[#0B1220] via-[#0E2236] to-[#091423]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-7 items-center justify-center rounded-md bg-emerald-600 px-2 text-[11px] font-extrabold">
                  F+
                </div>
                <div className="text-sm font-bold">FrotaPlus</div>
              </div>
              <Wifi className="h-5 w-5 text-white/70" />
            </div>

            <div className="mt-7">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Número do cartão
              </div>
              <div className="mt-2 font-mono text-lg font-bold tracking-[0.28em] text-white/95">
                {maskCard(card.last4)}
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Titular
                </div>
                <div className="mt-1 text-sm font-extrabold tracking-wide">
                  {card.owner.toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Validade
                </div>
                <div className="mt-1 text-sm font-extrabold">{card.validThru}</div>
              </div>
            </div>
          </div>

          {/* Balance + actions */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
            <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <div className="text-xs font-semibold text-zinc-500">
                Saldo Disponível
              </div>
              <div className="mt-1 text-2xl font-extrabold text-zinc-900">
                Kz {formatKz(card.balanceKz)}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-emerald-600"
                    style={{ width: `${Math.min(Math.max(card.usagePercent, 0), 100)}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-zinc-500">
                  {card.usagePercent}%
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                <span>Limite: Kz {formatKz(card.limitKz)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="h-12 w-full gap-2 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"
                onClick={onTopup}
                disabled={isBlocked}
              >
                <span className="text-lg leading-none">+</span>
                Carregar Saldo
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full gap-2 rounded-xl"
                onClick={onAlert}
                disabled={isBlocked}
              >
                <Bell className="h-4 w-4 text-zinc-600" />
                Alerta
              </Button>
            </div>
          </div>

          {/* Min limit */}
          <div className="mt-4 rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Limite mínimo
                </div>
                <div className="mt-1 text-sm font-extrabold text-zinc-900">
                  Kz {formatKz(card.minLimitKz)}
                </div>
              </div>
              <button
                type="button"
                onClick={onAlert}
                className="text-xs font-bold text-blue-600 hover:underline"
                disabled={isBlocked}
              >
                Alterar
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-700">
                Extrato de Movimentos
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Cartão: {card.last4}
              </div>
            </div>
            <button className="text-xs font-extrabold text-emerald-700 hover:underline">
              Ver tudo
            </button>
          </div>

          <div className="divide-y divide-zinc-50">
            {card.transactions.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm font-semibold text-zinc-400">
                Nenhuma transação registada para este cartão.
              </div>
            ) : (
              card.transactions.slice(0, 3).map((t) => {
                const isCredit = t.amountKz > 0;
                const Icon = isCredit ? TrendingUp : TrendingDown;
                return (
                  <div key={t.id} className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
                        <Icon
                          className={`h-5 w-5 ${isCredit ? "text-emerald-600" : "text-zinc-600"}`}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900">
                          {t.title}
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-zinc-400">
                          {t.date}
                          {t.location ? ` • ${t.location}` : ""}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-extrabold ${isCredit ? "text-emerald-600" : "text-zinc-700"}`}
                    >
                      {isCredit ? "+" : ""} Kz {formatKz(Math.abs(t.amountKz))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
            <button className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              Ver extrato completo →
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

