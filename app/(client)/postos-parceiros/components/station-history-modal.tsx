"use client";

import { useMemo, useState } from "react";
import { Droplet, FileText, MapPin } from "lucide-react";

import type { PartnerStation } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord, ManualFuelStatus } from "@/app/(client)/postos-parceiros/lib/mock-history";
import { historyByStationId } from "@/app/(client)/postos-parceiros/lib/mock-history";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TabKey = "TODOS" | "PENDENTES" | "REGULARIZACAO";

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function statusBadge(status: ManualFuelStatus) {
  switch (status) {
    case "ABERTO":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "APROVADO":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "EM REGULARIZAÇÃO":
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
}

function tabButton(active: boolean) {
  return active
    ? "bg-[#0B1220] text-white border-[#0B1220]"
    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50";
}

export default function StationHistoryModal({
  open,
  onOpenChange,
  station,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  station: PartnerStation | null;
}) {
  const [tab, setTab] = useState<TabKey>("TODOS");

  const records: ManualFuelRecord[] = useMemo(() => {
    if (!station) return [];
    return historyByStationId[station.id] ?? [];
  }, [station]);

  const filtered = useMemo(() => {
    if (tab === "TODOS") return records;
    if (tab === "REGULARIZACAO") return records.filter((r) => r.status === "EM REGULARIZAÇÃO");
    return records.filter((r) => r.status === "ABERTO" || r.status === "EM REGULARIZAÇÃO");
  }, [records, tab]);

  const totals = useMemo(() => {
    const totalKz = records.reduce((acc, r) => acc + r.amountKz, 0);
    const totalLiters = records.reduce((acc, r) => acc + r.liters, 0);
    return { totalKz, totalLiters, count: records.length };
  }, [records]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[980px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {station?.name ? `Histórico - ${station.name}` : "Histórico do Posto"}
          </DialogTitle>
        </DialogHeader>

        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-500" />
                <div className="truncate text-lg font-extrabold text-zinc-900">
                  {station?.name ?? "Posto"}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  {station?.city ?? "—"}
                </span>
                <span className="text-zinc-300">|</span>
                <span>Histórico de Abastecimentos Manuais</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                Registos
              </div>
              <div className="mt-2 text-3xl font-extrabold text-blue-800">
                {totals.count}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                KZ Total Faturado
              </div>
              <div className="mt-2 text-3xl font-extrabold text-emerald-800">
                KZ {formatKz(totals.totalKz)}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-amber-700">
                <Droplet className="h-4 w-4" />
                Volume Total
              </div>
              <div className="mt-2 text-3xl font-extrabold text-amber-800">
                {totals.totalLiters.toFixed(1)} L
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTab("TODOS")}
              className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "TODOS")}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTab("PENDENTES")}
              className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "PENDENTES")}`}
            >
              Pendentes / Pedidos
            </button>
            <button
              type="button"
              onClick={() => setTab("REGULARIZACAO")}
              className={`rounded-xl border px-4 py-2 text-sm font-bold ${tabButton(tab === "REGULARIZACAO")}`}
            >
              Em Regularização
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-100/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/60">
                  <TableHead>DATA</TableHead>
                  <TableHead>SOLICITANTE</TableHead>
                  <TableHead>VIATURA</TableHead>
                  <TableHead>VALOR / LITROS</TableHead>
                  <TableHead>ESTADO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="py-5">
                      <div className="text-sm font-bold text-zinc-700">{r.date}</div>
                      <div className="text-xs font-semibold text-zinc-400">{r.time}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-extrabold text-zinc-900">{r.requester}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-bold text-zinc-700">{r.vehicle}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-extrabold text-zinc-900">
                        KZ {formatKz(r.amountKz)}
                      </div>
                      <div className="text-xs font-semibold text-zinc-400">
                        {r.liters} L
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span
                        className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusBadge(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="text-sm font-semibold text-zinc-400">
                        Nenhum registo encontrado.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

