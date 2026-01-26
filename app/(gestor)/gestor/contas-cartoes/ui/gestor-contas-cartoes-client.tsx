"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarDays, Car, FileDown, FileSpreadsheet, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import type { Account, Transaction, TxType } from "@/app/(gestor)/gestor/contas-cartoes/lib/mock-contas-cartoes";
import { mockAccounts, mockTransactions } from "@/app/(gestor)/gestor/contas-cartoes/lib/mock-contas-cartoes";
import CreateAccountModal from "@/app/(gestor)/gestor/contas-cartoes/components/create-account-modal";
import AccountTopupModal from "@/app/(gestor)/gestor/contas-cartoes/components/account-topup-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TxFilter = "TODOS" | TxType;

function formatKz(v: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function parseISO(dateISO: string) {
  const m = dateISO.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(dateISO: string, startISO: string, endISO: string) {
  const d = parseISO(dateISO);
  if (!d) return false;
  const s = startISO ? parseISO(startISO) : null;
  const e = endISO ? parseISO(endISO) : null;
  if (s && d < s) return false;
  if (e) {
    // inclusive end date
    const end = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 23, 59, 59));
    if (d > end) return false;
  }
  return true;
}

function amountClass(amountKz: number) {
  return amountKz >= 0 ? "text-emerald-600" : "text-zinc-700";
}

export default function GestorContasCartoesClient() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const [createOpen, setCreateOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxFilter>("TODOS");
  const [query, setQuery] = useState("");

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const filteredTx = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (startDate || endDate) {
        if (!inRange(t.dateISO, startDate, endDate)) return false;
      }
      if (typeFilter !== "TODOS" && t.type !== typeFilter) return false;
      if (!q) return true;
      const blob = [
        t.title,
        t.location,
        t.plate ?? "",
        t.driver ?? "",
        t.refId,
        t.type,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [transactions, startDate, endDate, typeFilter, query]);

  async function exportExcel() {
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(
        filteredTx.map((t) => ({
          Data: t.dateISO,
          Tipo: t.type,
          Descrição: t.title,
          Local: t.location,
          "Motorista/Viatura": t.plate ? `${t.plate}${t.driver ? ` (${t.driver})` : ""}` : "N/A",
          Valor: t.amountKz,
        })),
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Extrato");
      XLSX.writeFile(wb, "relatorios-extratos.xlsx");
      toast.success("Excel gerado.");
    } catch {
      toast.error("Falha ao exportar Excel.");
    }
  }

  async function exportPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const margin = 42;
      let y = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Relatórios e Extratos", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Registos: ${filteredTx.length}`, margin, y);
      y += 18;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("DATA", margin, y);
      doc.text("DESCRIÇÃO", margin + 90, y);
      doc.text("VALOR (KZ)", margin + 420, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      for (const t of filteredTx.slice(0, 20)) {
        doc.text(t.dateISO, margin, y);
        doc.text(t.title.slice(0, 34), margin + 90, y);
        doc.text(String(t.amountKz), margin + 420, y);
        y += 14;
      }
      doc.save("relatorios-extratos.pdf");
      toast.success("PDF gerado.");
    } catch {
      toast.error("Falha ao gerar PDF.");
    }
  }

  return (
    <div className="w-full">
      <CreateAccountModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(acc) => setAccounts((prev) => [acc, ...prev])}
      />

      <AccountTopupModal
        open={topupOpen}
        onOpenChange={setTopupOpen}
        account={selectedAccount}
        onConfirm={async (amountKz) => {
          if (!selectedAccountId) return;
          setAccounts((prev) =>
            prev.map((a) => (a.id === selectedAccountId ? { ...a, balanceKz: a.balanceKz + amountKz } : a)),
          );
          setTransactions((prev) => [
            {
              id: crypto?.randomUUID?.() ?? `${Date.now()}`,
              dateISO: new Date().toISOString().slice(0, 10),
              type: "RECARGA",
              title: "Recarga Mensal",
              refId: `ID: ${crypto?.randomUUID?.()?.slice(0, 6) ?? "topup"}`,
              location: "Online / Sede",
              amountKz,
            },
            ...prev,
          ]);
        }}
      />

      <div className="mx-auto w-full max-w-[1240px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-2xl font-extrabold text-zinc-900">Gestão de Contas e Cartões</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Administração de saldos, empresas e emissão de relatórios.
            </div>
          </div>

          <Button
            type="button"
            className="h-11 rounded-xl bg-emerald-600 px-5 font-extrabold hover:bg-emerald-700"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        {/* Accounts list */}
        <div className="space-y-4">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-600">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-zinc-900">{a.name}</div>
                    <div className="mt-1 font-mono text-sm font-semibold text-zinc-400">{a.accountNumber}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-600">
                        {a.activeCards} Cartões Ativos
                      </span>
                      <span className="inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                        {a.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-400">Saldo Disponível</div>
                    <div className="mt-1 text-2xl font-extrabold text-zinc-900">KZ {formatKz(a.balanceKz)}</div>
                  </div>
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-blue-600 px-5 font-extrabold hover:bg-blue-700"
                    onClick={() => {
                      setSelectedAccountId(a.id);
                      setTopupOpen(true);
                    }}
                  >
                    Carregar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports & extracts */}
        <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          <div className="border-b border-zinc-100 px-6 py-5">
            <div className="text-base font-extrabold text-zinc-900">Relatórios e Extratos</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Exporte o histórico de transações filtrado por período, tipo, veículo ou motorista.
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 lg:grid-cols-[220px_220px_220px_1fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Início</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-800 pl-10 text-white border-zinc-700 focus-visible:ring-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Fim</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-800 pl-10 text-white border-zinc-700 focus-visible:ring-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Tipo</Label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TxFilter)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ABASTECIMENTO">Abastecimento</SelectItem>
                  <SelectItem value="RECARGA">Recarga</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                Motorista / Viatura
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome ou Matricula..."
                  className="h-11 rounded-xl bg-zinc-800 pl-10 text-white border-zinc-700 placeholder:text-zinc-400 focus-visible:ring-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                onClick={exportExcel}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                onClick={exportPdf}
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="overflow-hidden border-t border-zinc-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/40">
                  <TableHead>DATA</TableHead>
                  <TableHead>DESCRIÇÃO / OPERAÇÃO</TableHead>
                  <TableHead>LOCAL / POSTO</TableHead>
                  <TableHead>MOTORISTA / VIATURA</TableHead>
                  <TableHead className="text-right">VALOR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTx.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="py-5">
                      <div className="text-sm font-semibold text-zinc-600">{t.dateISO}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-extrabold text-zinc-900">{t.title}</div>
                      <div className="text-xs font-semibold text-zinc-400">{t.refId}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-semibold text-zinc-600">{t.location}</div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm font-semibold text-zinc-600">
                        {t.plate ? (
                          <span className="inline-flex items-center gap-2">
                            <Car className="h-4 w-4 text-zinc-400" />
                            <span className="inline-flex h-7 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-extrabold text-zinc-700">
                              {t.plate}
                            </span>
                            {t.driver ? (
                              <span className="text-xs font-semibold text-zinc-500">({t.driver})</span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-zinc-500">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      <div className={`text-sm font-extrabold ${amountClass(t.amountKz)}`}>
                        {t.amountKz >= 0 ? "+" : "-"} {formatKz(Math.abs(t.amountKz))} <span className="text-xs font-extrabold text-zinc-600">KZ</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredTx.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center">
                      <div className="text-sm font-semibold text-zinc-400">Nenhum registo encontrado.</div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 px-6 py-4 text-xs font-semibold text-zinc-400 lg:flex-row lg:items-center lg:justify-between">
            <div>Mostrando {Math.min(filteredTx.length, filteredTx.length)} de {filteredTx.length} registos</div>
          </div>
        </div>
      </div>
    </div>
  );
}

