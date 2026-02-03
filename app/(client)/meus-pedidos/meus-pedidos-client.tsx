"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TicketsTable from "@/app/(client)/meus-pedidos/components/tickets-table";
import {
  type Ticket,
  type TicketStatus,
} from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import CreateTicketModal from "@/app/(client)/meus-pedidos/components/create-ticket-modal";
import TicketDetailsModal from "@/app/(client)/meus-pedidos/components/ticket-details-modal";
import { ApiError } from "@/app/lib/api/api-client";
import { useDeleteTicket, useTickets } from "@/app/lib/api/tickets-hooks";
import { apiTicketToUi, uiStatusToApi } from "@/app/(client)/meus-pedidos/lib/ticket-api-mapper";
import EmptyState from "@/components/ui/empty-state";

export default function MeusPedidosClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const apiStatus = statusFilter === "TODOS" ? undefined : uiStatusToApi(statusFilter as TicketStatus);
  const ticketsQuery = useTickets({
    status: apiStatus,
    search: searchQuery.trim() ? searchQuery.trim() : undefined,
    page: 1,
    page_size: 100,
  });
  const deleteMutation = useDeleteTicket();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ticketsQuery.isError) return;
    const err = ticketsQuery.error;
    const message = err instanceof ApiError ? err.message : "Falha ao carregar tickets.";
    if (lastErrorRef.current === message) return;
    lastErrorRef.current = message;
    toast.error(message);
  }, [ticketsQuery.error, ticketsQuery.isError]);

  const tickets = useMemo<Ticket[]>(() => {
    const list = ticketsQuery.data ?? [];
    return list.map((t) => apiTicketToUi(t, "Cliente"));
  }, [ticketsQuery.data]);

  return (
    <div className="w-full">
      <CreateTicketModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        requesterName="Lorrys Cliente"
        requesterRole="Cliente"
        mode="api"
      />

      <TicketDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => {
          setDetailsOpen(v);
          if (!v) setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />

      <div className="w-full overflow-hidden rounded-2xl border border-zinc-100/50 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col gap-4 border-b border-zinc-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar nos meus pedidos..."
              className="h-11 rounded-xl border-zinc-200 pl-10 text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[240px]">
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
              className="h-11 gap-2 rounded-xl bg-emerald-600 px-5 font-bold hover:bg-emerald-700"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Solicitar
            </Button>
          </div>
        </div>

        {ticketsQuery.isLoading ? (
          <div className="px-6 py-6 text-sm font-semibold text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
              A carregar tickets...
            </span>
          </div>
        ) : null}

        {!ticketsQuery.isLoading && tickets.length === 0 ? (
          <div className="px-6 py-6">
            <EmptyState
              icon={FileText}
              title="Nenhum pedido encontrado"
              description="Quando criares um ticket, ele vai aparecer aqui. Usa o botão “Solicitar” para abrir um novo pedido."
              actionLabel="Solicitar"
              onAction={() => setIsCreateOpen(true)}
            />
          </div>
        ) : (
          <TicketsTable
            tickets={tickets}
            onViewDetails={(t) => {
              setSelectedTicket(t);
              setDetailsOpen(true);
            }}
            onDelete={(t) => {
              deleteMutation.mutate(t.id, {
                onSuccess: () => toast.success("Ticket removido."),
                onError: () => toast.error("Falha ao remover ticket."),
              });
            }}
          />
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
          <div className="text-sm font-medium text-zinc-500">
            Mostrando {tickets.length} resultado
            {tickets.length !== 1 && "s"}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="rounded-lg">
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled className="rounded-lg">
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
