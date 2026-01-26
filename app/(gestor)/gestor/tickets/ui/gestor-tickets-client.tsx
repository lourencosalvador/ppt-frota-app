"use client";

import { useMemo, useState } from "react";
import { Check, Eye, FileText, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import type { Ticket, TicketStatus } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { Button } from "@/components/ui/button";
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
import TicketPriorityBadge from "@/app/(client)/meus-pedidos/components/ticket-priority-badge";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";

import TicketDetailsModal from "@/app/(client)/meus-pedidos/components/ticket-details-modal";
import CreateTicketModal from "@/app/(client)/meus-pedidos/components/create-ticket-modal";
import { gestorTicketsMock, type GestorTicket } from "@/app/(gestor)/gestor/tickets/lib/mock-gestor-tickets";
import SupportTicketDetailsSheet from "@/app/(suporte)/suporte/fila-tickets/components/support-ticket-details-sheet";

function normalize(v: string) {
  return v.trim().toLowerCase();
}

export default function GestorTicketsClient({
  creatorName = "Carlos Gestor",
  creatorRole = "Gestor",
  detailsVariant = "default",
}: {
  creatorName?: string;
  creatorRole?: string;
  detailsVariant?: "default" | "support";
} = {}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [tickets, setTickets] = useState<GestorTicket[]>(gestorTicketsMock);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(search);
    let rows = [...tickets];

    if (status !== "TODOS") {
      rows = rows.filter((t) => t.status === (status as TicketStatus));
    }

    if (q) {
      rows = rows.filter((t) => {
        const hay = [
          t.code,
          t.subject,
          t.requester,
          t.requesterRole,
          (t as GestorTicket).requesterId ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return rows;
  }, [tickets, search, status]);

  function approve(t: GestorTicket) {
    setTickets((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status: "APROVADO" as TicketStatus } : x)),
    );
    toast.success("Ticket aprovado.");
  }

  function reject(t: GestorTicket) {
    setTickets((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status: "REJEITADO" as TicketStatus } : x)),
    );
    toast.success("Ticket rejeitado.");
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      {detailsVariant === "support" ? (
        <SupportTicketDetailsSheet
          open={detailsOpen}
          onOpenChange={(v) => {
            setDetailsOpen(v);
            if (!v) setSelected(null);
          }}
          ticket={selected}
        />
      ) : (
        <TicketDetailsModal
          open={detailsOpen}
          onOpenChange={(v) => {
            setDetailsOpen(v);
            if (!v) setSelected(null);
          }}
          ticket={selected}
        />
      )}

      <CreateTicketModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        requesterName={creatorName}
        requesterRole={creatorRole}
        existingTickets={tickets}
        onCreate={(t) => {
          const requesterName = (t.requester ?? "").trim().split(/\s+/)[0] || t.requester;
          setTickets((prev) => [{ ...(t as GestorTicket), requesterName }, ...prev]);
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 border-b border-zinc-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por ID ou cliente..."
              className="h-11 rounded-xl border-zinc-200 pl-10 text-sm font-semibold"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 w-[220px] rounded-xl">
                <SelectValue placeholder="Todos os Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Estados</SelectItem>
                <SelectItem value="EM ANALISE">Em Análise</SelectItem>
                <SelectItem value="ABERTO">Aberto</SelectItem>
                <SelectItem value="ATRIBUIDO">Atribuído</SelectItem>
                <SelectItem value="APROVADO">Aprovado</SelectItem>
                <SelectItem value="REJEITADO">Rejeitado</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-11 gap-2 rounded-xl bg-emerald-600 px-5 font-extrabold hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Novo Ticket
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50">
                <TableHead>ID / Assunto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                        <FileText className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-zinc-400">{t.code}</div>
                        <div className="mt-0.5 truncate text-sm font-extrabold text-zinc-900">
                          {t.subject}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-500">
                      {t.type}
                    </div>
                  </TableCell>

                  <TableCell className="py-5">
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900">
                        {t.requesterName}
                      </div>
                      <div className="text-xs font-semibold text-zinc-400">{t.requesterRole}</div>
                    </div>
                  </TableCell>

                  <TableCell className="py-5">
                    <TicketPriorityBadge priority={t.priority} />
                  </TableCell>

                  <TableCell className="py-5">
                    <TicketStatusBadge status={t.status} />
                  </TableCell>

                  <TableCell className="py-5 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      {t.status === "EM ANALISE" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => approve(t)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-emerald-700 hover:bg-emerald-50"
                            aria-label="Aprovar"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(t)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                            aria-label="Rejeitar"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(t);
                          setDetailsOpen(true);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-50"
                        aria-label="Ver detalhes"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="text-sm font-semibold text-zinc-400">
                      Nenhum ticket encontrado.
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
          <div className="text-sm font-semibold text-zinc-500">
            Mostrando {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled className="rounded-lg">
              Anterior
            </Button>
            <Button type="button" variant="outline" size="sm" disabled className="rounded-lg">
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

