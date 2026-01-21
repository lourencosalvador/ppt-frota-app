"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
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
  mockTickets,
  type Ticket,
  type TicketStatus,
} from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import CreateTicketModal from "@/app/(client)/meus-pedidos/components/create-ticket-modal";
import TicketDetailsModal from "@/app/(client)/meus-pedidos/components/ticket-details-modal";

export default function MeusPedidosClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (statusFilter !== "TODOS") {
      result = result.filter((t) => t.status === (statusFilter as TicketStatus));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.code.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          t.type.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, statusFilter, tickets]);

  return (
    <div className="w-full">
      <CreateTicketModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        requesterName="Lorrys Cliente"
        requesterRole="Cliente"
        existingTickets={tickets}
        onCreate={(t) => {
          setTickets((prev) => [t, ...prev]);
          if (statusFilter !== "TODOS" && t.status !== (statusFilter as TicketStatus)) {
            toast.message("Ticket criado, mas não aparece por causa do filtro de estado.");
          }
        }}
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

        <TicketsTable
          tickets={filteredTickets}
          onViewDetails={(t) => {
            setSelectedTicket(t);
            setDetailsOpen(true);
          }}
          onDelete={(t) => {
            setTickets((prev) => prev.filter((x) => x.id !== t.id));
            toast.success("Ticket removido.");
          }}
        />

        <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
          <div className="text-sm font-medium text-zinc-500">
            Mostrando {filteredTickets.length} resultado
            {filteredTickets.length !== 1 && "s"}
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
