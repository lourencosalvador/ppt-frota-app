"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, FileText, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import type { Ticket, TicketPriority } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { ApiError } from "@/app/lib/api/api-client";
import { useTickets, useUpdateTicket } from "@/app/lib/api/tickets-hooks";
import { apiTicketToUi, uiStatusToApi } from "@/app/(client)/meus-pedidos/lib/ticket-api-mapper";
import type { TicketStatus as UiTicketStatus } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import EmptyState from "@/components/ui/empty-state";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";
import TicketDetailsModal from "@/app/(client)/meus-pedidos/components/ticket-details-modal";
import SupportCreateTicketModal from "../components/support-create-ticket-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SupportStatusFilter = "TODOS" | UiTicketStatus;

const PAGE_SIZE = 10;

function priorityDot(p: TicketPriority) {
  if (p === "Urgente") return "bg-red-500";
  if (p === "Alta") return "bg-orange-500";
  if (p === "Baixa") return "bg-blue-500";
  return "bg-emerald-500";
}

function priorityTextColor(p: TicketPriority) {
  if (p === "Urgente") return "text-red-700";
  if (p === "Alta") return "text-orange-700";
  if (p === "Baixa") return "text-blue-700";
  return "text-zinc-600";
}

export default function SuporteFilaTicketsClient() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SupportStatusFilter>("TODOS");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [page, setPage] = useState(1);

  const apiStatus = status === "TODOS" ? undefined : uiStatusToApi(status as UiTicketStatus);
  const ticketsQuery = useTickets({
    status: apiStatus,
    search: q.trim() || undefined,
    page: 1,
    page_size: 200,
  });
  const updateMutation = useUpdateTicket();
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
    return list.map((t) => apiTicketToUi(t, "Suporte"));
  }, [ticketsQuery.data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tickets;
    return tickets.filter((t) => {
      const blob = `${t.code} ${t.subject} ${t.requester} ${t.requesterRole} ${t.type}`.toLowerCase();
      return blob.includes(query);
    });
  }, [tickets, q]);

  useEffect(() => {
    setPage(1);
  }, [q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

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
      <SupportCreateTicketModal open={createOpen} onOpenChange={setCreateOpen} />

      <div className="rounded-2xl border border-zinc-100/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        {/* Header with search, filter, action */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por ID ou motorista..."
              className="h-11 rounded-2xl pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={status} onValueChange={(v) => setStatus(v as SupportStatusFilter)}>
              <SelectTrigger className="h-11 w-48 rounded-2xl">
                <SelectValue placeholder="Todos os Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Estados</SelectItem>
                <SelectItem value="ABERTO">Aberto</SelectItem>
                <SelectItem value="EM ANALISE">Em Análise</SelectItem>
                <SelectItem value="ATRIBUIDO">Atribuído</SelectItem>
                <SelectItem value="APROVADO">Aprovado</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                <SelectItem value="REJEITADO">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              className="h-11 rounded-2xl bg-emerald-600 px-5 hover:bg-emerald-700"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Ticket
            </Button>
          </div>
        </div>

        {/* Loading */}
        {ticketsQuery.isLoading && (
          <div className="px-6 py-12 text-sm font-semibold text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
              A carregar tickets...
            </span>
          </div>
        )}

        {/* Empty */}
        {!ticketsQuery.isLoading && filtered.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Nenhum ticket encontrado"
            description="Os tickets dos clientes aparecerão aqui quando forem criados."
          />
        )}

        {/* Table */}
        {!ticketsQuery.isLoading && filtered.length > 0 && (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_160px_160px_120px_130px_80px] gap-4 border-b border-zinc-100 bg-zinc-50/40 px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              <div>ID / Assunto</div>
              <div>Tipo</div>
              <div>Solicitante</div>
              <div>Prioridade</div>
              <div>Estado</div>
              <div className="text-right">Ações</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-100">
              {paginated.map((t) => (
                <div key={t.id} className="grid grid-cols-[1fr_160px_160px_120px_130px_80px] gap-4 px-6 py-5">
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">{t.code}</div>
                    <div className="mt-0.5 truncate text-sm font-extrabold text-zinc-900">{t.subject}</div>
                  </div>

                  <div className="text-xs font-semibold uppercase text-zinc-600">{t.type}</div>

                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{t.requester}</div>
                    <div className="text-xs font-semibold text-zinc-400">
                      {t.fleet ? t.fleet : t.requesterRole}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot(t.priority)}`} />
                    <span className={`text-xs font-semibold ${priorityTextColor(t.priority)}`}>{t.priority}</span>
                  </div>

                  <div className="flex items-center">
                    <TicketStatusBadge status={t.status} />
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      onClick={() => {
                        setSelected(t);
                        setDetailsOpen(true);
                      }}
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with pagination */}
            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
              <div className="text-xs font-semibold text-zinc-400">
                Mostrando {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl px-4 text-xs font-semibold"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl px-4 text-xs font-semibold"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
