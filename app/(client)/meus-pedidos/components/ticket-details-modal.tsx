"use client";

import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="col-span-2 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export default function TicketDetailsModal({
  open,
  onOpenChange,
  ticket,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: Ticket | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Ticket</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          {!ticket ? (
            <div className="text-sm font-medium text-zinc-500">Sem dados.</div>
          ) : (
            <div className="space-y-2">
              <Row label="Código" value={ticket.code} />
              <Row label="Assunto" value={ticket.subject} />
              <Row label="Tipo" value={ticket.requestTypeLabel ?? ticket.type} />
              <Row label="Solicitante" value={`${ticket.requester} (${ticket.requesterRole})`} />
              <Row label="Prioridade" value={ticket.priority} />
              <Row label="Estado" value={ticket.status} />
              <Row label="Data" value={ticket.createdAt} />
              <Row label="Matrícula" value={ticket.matricula ?? "—"} />
              <Row label="Anexo" value={ticket.attachmentName ?? "—"} />
              <div className="pt-3">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Descrição
                </div>
                <div className="mt-2 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-medium text-zinc-700">
                  {ticket.description ?? "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

