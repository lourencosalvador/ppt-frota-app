"use client";

import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";
import TicketPriorityBadge from "@/app/(client)/meus-pedidos/components/ticket-priority-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TicketsTable({
  tickets,
  onViewDetails,
  onDelete,
}: {
  tickets: Ticket[];
  onViewDetails?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm font-semibold text-zinc-400">
        Nenhum ticket encontrado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Código</TableHead>
          <TableHead className="font-bold">Assunto</TableHead>
          <TableHead className="font-bold">Tipo</TableHead>
          <TableHead className="font-bold">Prioridade</TableHead>
          <TableHead className="font-bold">Estado</TableHead>
          <TableHead className="font-bold">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((t) => (
          <TableRow
            key={t.id}
            className="cursor-pointer hover:bg-zinc-50"
            onClick={() => onViewDetails?.(t)}
          >
            <TableCell className="font-bold text-zinc-900">{t.code}</TableCell>
            <TableCell>{t.subject}</TableCell>
            <TableCell className="text-xs">{t.type}</TableCell>
            <TableCell><TicketPriorityBadge priority={t.priority} /></TableCell>
            <TableCell><TicketStatusBadge status={t.status} /></TableCell>
            <TableCell className="text-xs text-zinc-500">{t.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
