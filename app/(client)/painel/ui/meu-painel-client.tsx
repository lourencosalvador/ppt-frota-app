"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CreditCard, Clock, ShieldCheck, MapPin } from "lucide-react";

import { getStoredSession, type AppSession } from "@/app/lib/auth/session";
import { useCards } from "@/app/lib/api/cards-hooks";
import type { ApiCard } from "@/app/lib/api/cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatKz(v: string | number | undefined | null): string {
  if (!v) return "0,00KZS";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.,-]/g, "").replace(",", ".")) || 0;
  return `${new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}KZS`;
}

function formatCardNumber(uid: string | undefined): string {
  if (!uid) return "— — — —";
  const clean = uid.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  } catch {
    return "—";
  }
}

const statusMap: Record<string, { label: string; color: string }> = {
  approved: { label: "APROVADO", color: "text-emerald-700" },
  completed: { label: "APROVADO", color: "text-emerald-700" },
  active: { label: "APROVADO", color: "text-emerald-700" },
  pending: { label: "APROVADO", color: "text-amber-700" },
  rejected: { label: "REJEITADO", color: "text-red-600" },
  cancelled: { label: "REJEITADO", color: "text-red-600" },
};

const mockTransactions = [
  { id: "t1", litros: "20L", data: "21/01 2026", valor: "14.000KZS", posto: "PUMANGOL VIANA", status: "rejected" },
  { id: "t2", litros: "3L", data: "12/01 2026", valor: "10.800KZS", posto: "PUMANGOL MAIANGA", status: "approved" },
  { id: "t3", litros: "44L", data: "21/12 2025", valor: "22.800KZS", posto: "PUMANGOL CACUACO", status: "approved" },
  { id: "t4", litros: "3L", data: "21/06/2026", valor: "5.000KZS", posto: "PUMANGOL SAMBA", status: "approved" },
  { id: "t5", litros: "44L", data: "01/12 2025", valor: "80.000KZS", posto: "PUMANGOL BOA LUZ", status: "rejected" },
];

export default function MeuPainelClient() {
  const [session, setSession] = useState<AppSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const name = session?.name ?? "Colaborador";
  const cardsQuery = useCards();

  const card: ApiCard | null = useMemo(() => {
    if (!cardsQuery.data?.length) return null;
    return cardsQuery.data.find((c) => c.status === "active") ?? cardsQuery.data[0];
  }, [cardsQuery.data]);

  const cardStatusLabel = card?.status === "active" ? "ATIVO" : card?.status === "blocked" ? "BLOQUEADO" : card?.status ? card.status.toUpperCase() : "—";
  const cardStatusColor = card?.status === "active" ? "text-emerald-700" : card?.status === "blocked" ? "text-red-600" : "text-zinc-600";

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 px-8 py-7 shadow-[0_4px_20px_rgb(16,185,129,0.15)]">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold text-white sm:text-xl">
              OLÁ, SR {name.toUpperCase()} BEM-VINDO DE VOLTA
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-10 gap-y-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Número do Cartão</div>
                <div className="mt-0.5 text-sm font-extrabold tracking-wider text-white">
                  {formatCardNumber(card?.uid)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Data de Validação</div>
                <div className="mt-0.5 text-sm font-extrabold text-white">
                  {formatExpiry(card?.expires_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Saldo Disponível</div>
          <div className="mt-1 text-2xl font-extrabold text-zinc-900">{formatKz(card?.current_balance)}</div>
        </div>

        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Clock className="h-5 w-5" />
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Limite Diário</div>
          <div className="mt-1 text-2xl font-extrabold text-zinc-900">{formatKz(card?.daily_limit)}</div>
        </div>

        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className={`mt-4 text-2xl font-extrabold ${cardStatusColor}`}>{cardStatusLabel}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Status Cartão</div>
        </div>
      </div>

      {/* Últimos Abastecimentos */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div className="text-sm font-extrabold uppercase tracking-widest text-zinc-900">Últimos Abastecimentos</div>
          <Link
            href="/historico"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 transition hover:text-emerald-700"
          >
            Ver mais
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {cardsQuery.isLoading ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
              A carregar...
            </span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-extrabold uppercase tracking-widest">Quantidade/Litros</TableHead>
                <TableHead className="text-[10px] font-extrabold uppercase tracking-widest">Data</TableHead>
                <TableHead className="text-[10px] font-extrabold uppercase tracking-widest">Valor/KZS</TableHead>
                <TableHead className="text-[10px] font-extrabold uppercase tracking-widest">Posto de Abastecimento</TableHead>
                <TableHead className="text-[10px] font-extrabold uppercase tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => {
                const st = statusMap[tx.status] ?? { label: tx.status.toUpperCase(), color: "text-zinc-600" };
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm font-semibold text-zinc-900">{tx.litros}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-600">{tx.data}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-900">{tx.valor}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-600">{tx.posto}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-extrabold ${st.color}`}>{st.label}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
