"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Search, Zap } from "lucide-react";
import { toast } from "sonner";

import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { mockTickets } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import TicketPriorityBadge from "@/app/(client)/meus-pedidos/components/ticket-priority-badge";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";
import TicketDetailsModal from "@/app/(client)/meus-pedidos/components/ticket-details-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SupportStatusFilter = "TODOS" | Ticket["status"];

export default function SuporteFilaTicketsClient() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SupportStatusFilter>("TODOS");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tickets.filter((t) => {
      if (status !== "TODOS" && t.status !== status) return false;
      if (!query) return true;
      const blob = `${t.code} ${t.subject} ${t.requester} ${t.requesterRole}`.toLowerCase();
      return blob.includes(query);
    });
  }, [tickets, q, status]);

  function resolveTicket(t: Ticket) {
    setTickets((prev) => prev.map((p) => (p.id === t.id ? { ...p, status: "CONCLUIDO" as any } : p)));
    toast.success("Ticket marcado como concluído.");
  }

  function inProgress(t: Ticket) {
    setTickets((prev) => prev.map((p) => (p.id === t.id ? { ...p, status: "EM ANALISE" as any } : p)));
    toast.message("Ticket em atendimento.");
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <TicketDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => {
          setDetailsOpen(v);
          if (!v) setSelected(null);
        }}
        ticket={selected}
      />

      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Fila de Tickets</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Pesquisa, filtra e atua sobre solicitações do cliente.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar por código, assunto ou cliente..."
                className="h-11 w-[320px] rounded-xl pl-10"
              />
            </div>

            <Select value={status} onValueChange={(v) => setStatus(v as SupportStatusFilter)}>
              <SelectTrigger className="h-11 w-[240px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ABERTO">ABERTO</SelectItem>
                <SelectItem value="EM ANALISE">EM ANÁLISE</SelectItem>
                <SelectItem value="CONCLUIDO">CONCLUÍDO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-100/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/60">
                <TableHead>TICKET</TableHead>
                <TableHead>CLIENTE</TableHead>
                <TableHead>PRIORIDADE</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead className="text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="py-5">
                    <div className="text-xs font-bold text-zinc-400">{t.code}</div>
                    <div className="mt-0.5 text-sm font-extrabold text-zinc-900">{t.subject}</div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="text-sm font-extrabold text-zinc-900">{t.requester}</div>
                    <div className="text-xs font-semibold text-zinc-400">{t.requesterRole}</div>
                  </TableCell>
                  <TableCell className="py-5">
                    <TicketPriorityBadge priority={t.priority} />
                  </TableCell>
                  <TableCell className="py-5">
                    <TicketStatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center justify-end gap-2">
                      {t.status !== ("CONCLUIDO" as any) ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-xl"
                            onClick={() => inProgress(t)}
                          >
                            <Zap className="h-4 w-4" />
                            Em atendimento
                          </Button>
                          <Button
                            type="button"
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => resolveTicket(t)}
                          >
                            <Check className="h-4 w-4" />
                            Concluir
                          </Button>
                        </>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 rounded-xl px-0"
                        onClick={() => {
                          setSelected(t);
                          setDetailsOpen(true);
                        }}
                        aria-label="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 text-center">
                    <div className="text-sm font-semibold text-zinc-400">Nenhum ticket encontrado.</div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

