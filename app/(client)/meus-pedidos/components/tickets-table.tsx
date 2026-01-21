import { Eye, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import TicketStatusBadge from "@/app/(client)/meus-pedidos/components/ticket-status-badge";
import TicketPriorityBadge from "@/app/(client)/meus-pedidos/components/ticket-priority-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function TicketsTable({
  tickets,
  onViewDetails,
  onDelete,
}: {
  tickets: Ticket[];
  onViewDetails: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
}) {
  return (
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
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <FileText className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-400">
                      {ticket.code}
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-zinc-900">
                      {ticket.subject}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  {ticket.type}
                </div>
              </TableCell>

              <TableCell className="py-5">
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    {ticket.requester}
                  </div>
                  <div className="text-xs font-medium text-zinc-400">
                    {ticket.requesterRole}
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-5">
                <TicketPriorityBadge priority={ticket.priority} />
              </TableCell>

              <TableCell className="py-5">
                <TicketStatusBadge status={ticket.status} />
              </TableCell>

              <TableCell className="py-5 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-zinc-500 hover:bg-zinc-50"
                      aria-label="Ações"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onViewDetails(ticket)}>
                      <Eye className="h-4 w-4 text-zinc-600" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onSelect={() => onDelete(ticket)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="text-sm font-medium text-zinc-400">
                  Nenhum pedido encontrado.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
