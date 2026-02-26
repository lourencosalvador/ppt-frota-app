"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Fuel, Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

type TxStatus = "approved" | "rejected" | "pending";

interface Transaction {
  id: string;
  litros: string;
  data: string;
  valor: string;
  posto: string;
  status: TxStatus;
}

const statusConfig: Record<TxStatus, { label: string; color: string; bg: string; border: string }> = {
  approved: { label: "APROVADO", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  pending: { label: "PENDENTE", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  rejected: { label: "REJEITADO", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
};

const mockTransactions: Transaction[] = [
  { id: "t1", litros: "20L", data: "21/01/2026", valor: "14.000KZS", posto: "PUMANGOL VIANA", status: "rejected" },
  { id: "t2", litros: "3L", data: "12/01/2026", valor: "10.800KZS", posto: "PUMANGOL MAIANGA", status: "approved" },
  { id: "t3", litros: "44L", data: "21/12/2025", valor: "22.800KZS", posto: "PUMANGOL CACUACO", status: "approved" },
  { id: "t4", litros: "3L", data: "21/06/2026", valor: "5.000KZS", posto: "PUMANGOL SAMBA", status: "approved" },
  { id: "t5", litros: "44L", data: "01/12/2025", valor: "80.000KZS", posto: "PUMANGOL BOA LUZ", status: "rejected" },
  { id: "t6", litros: "15L", data: "05/11/2025", valor: "7.500KZS", posto: "PUMANGOL KILAMBA", status: "approved" },
  { id: "t7", litros: "30L", data: "18/10/2025", valor: "15.600KZS", posto: "PUMANGOL TALATONA", status: "pending" },
  { id: "t8", litros: "10L", data: "02/10/2025", valor: "5.200KZS", posto: "PUMANGOL BENFICA", status: "approved" },
  { id: "t9", litros: "50L", data: "15/09/2025", valor: "26.000KZS", posto: "PUMANGOL VIANA", status: "approved" },
  { id: "t10", litros: "25L", data: "28/08/2025", valor: "13.000KZS", posto: "PUMANGOL CACUACO", status: "rejected" },
];

const uniquePostos = [...new Set(mockTransactions.map((t) => t.posto))];

export default function HistoricoAbastecimentosClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TxStatus | "all">("all");
  const [postoFilter, setPostoFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockTransactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (postoFilter !== "all" && tx.posto !== postoFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesPosto = tx.posto.toLowerCase().includes(q);
        const matchesValor = tx.valor.toLowerCase().includes(q);
        const matchesData = tx.data.includes(q);
        if (!matchesPosto && !matchesValor && !matchesData) return false;
      }
      return true;
    });
  }, [search, statusFilter, postoFilter]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const approved = filtered.filter((t) => t.status === "approved").length;
    const rejected = filtered.filter((t) => t.status === "rejected").length;
    return { total, approved, rejected };
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="text-lg font-extrabold text-zinc-900">Histórico de Abastecimentos</div>
        <div className="mt-1 text-sm font-semibold text-zinc-500">
          Consulta todas as transações de abastecimento realizadas com o teu cartão.
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">{kpis.total}</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Total de Transações</div>
        </div>
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Fuel className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">{kpis.approved}</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Aprovadas</div>
        </div>
        <div className="rounded-2xl border border-zinc-100/60 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Fuel className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-extrabold text-zinc-900">{kpis.rejected}</div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">Rejeitadas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por posto, valor, data..."
            className="h-11 rounded-2xl pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TxStatus | "all")}>
            <SelectTrigger className="h-11 w-44 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={postoFilter} onValueChange={setPostoFilter}>
            <SelectTrigger className="h-11 w-56 rounded-2xl">
              <SelectValue placeholder="Posto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os postos</SelectItem>
              {uniquePostos.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Fuel}
            title="Nenhuma transação encontrada"
            description="Ajusta os filtros para encontrar as transações pretendidas."
          />
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
              {filtered.map((tx) => {
                const st = statusConfig[tx.status];
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm font-semibold text-zinc-900">{tx.litros}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-600">{tx.data}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-900">{tx.valor}</TableCell>
                    <TableCell className="text-sm font-semibold text-zinc-600">{tx.posto}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${st.color} ${st.bg} ${st.border}`}>
                        {st.label}
                      </span>
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
