"use client";

import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function statusLabel(status: Ticket["status"]) {
  switch (status) {
    case "EM ANALISE":
      return "Aguardando Informação";
    case "ABERTO":
      return "Aberto";
    case "ATRIBUIDO":
      return "Atribuído";
    case "APROVADO":
      return "Aprovado";
    case "REJEITADO":
      return "Rejeitado";
    case "CONCLUIDO":
      return "Concluído";
  }
}

function statusPillClass(status: Ticket["status"]) {
  switch (status) {
    case "ABERTO":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "APROVADO":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REJEITADO":
      return "bg-red-50 text-red-700 border-red-100";
    case "CONCLUIDO":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "ATRIBUIDO":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "EM ANALISE":
      return "bg-amber-50 text-amber-800 border-amber-100";
  }
}

function priorityDotClass(priority: Ticket["priority"]) {
  switch (priority) {
    case "Urgente":
      return "bg-red-500";
    case "Alta":
      return "bg-amber-500";
    case "Normal":
      return "bg-blue-500";
    case "Baixa":
      return "bg-zinc-400";
  }
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center gap-6 py-2">
      <div className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="min-w-0 text-sm font-semibold text-zinc-900">{children}</div>
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
  const defaults = useMemo(() => {
    if (!ticket) {
      return {
        responsible: "Bruno Carvalho (Atendimento)",
        lastAction: "",
        lastUpdated: "",
        nextAction: "",
        nextDate: "",
        notes: "",
        history: [] as Array<{ id: string; date: string; text: string }>,
      };
    }
    const created = ticket.createdAt;
    const base = [
      { id: "h1", date: created, text: `Ticket criado (${ticket.requester.split(" ")[0] ?? "Cliente"})` },
      { id: "h2", date: "2024-01-16", text: "Em análise (Bruno Carvalho)" },
      {
        id: "h3",
        date: "2024-01-18",
        text: "Aguardando documentação do cliente (Bruno Carvalho)",
      },
    ];
    return {
      responsible: "Bruno Carvalho (Atendimento)",
      lastAction: "Ticket revisado e aguardando documentações do cliente",
      lastUpdated: "2024-01-18 14:30",
      nextAction: "Revisar documentação recebida",
      nextDate: "2024-01-20",
      notes:
        "Aguardando envio dos documentos necessários por parte do cliente antes de prosseguir com a solicitação.",
      history: base,
    };
  }, [ticket]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[980px] overflow-hidden p-0 max-h-[90vh]">
        <div className="flex max-h-[90vh] flex-col">
          <div className="border-b border-zinc-100 py-5 pl-6 pr-16">
            <DialogHeader className="border-0 px-0 py-0">
              <DialogTitle className="text-2xl font-extrabold">Detalhes do Ticket</DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">
          {!ticket ? (
            <div className="text-sm font-semibold text-zinc-500">Sem dados.</div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-zinc-100 bg-white px-5 py-4">
                <FieldRow label="CÓDIGO">{ticket.code}</FieldRow>
                <FieldRow label="ASSUNTO">{ticket.subject}</FieldRow>
                <FieldRow label="TIPO">{ticket.requestTypeLabel ?? ticket.type}</FieldRow>
                <FieldRow label="SOLICITANTE">
                  {ticket.requester} ({ticket.requesterRole})
                </FieldRow>
                <FieldRow label="PRIORIDADE">
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${priorityDotClass(ticket.priority)}`} />
                    {ticket.priority}
                  </span>
                </FieldRow>
                <FieldRow label="ESTADO">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${statusPillClass(ticket.status)}`}
                  >
                    {statusLabel(ticket.status)}
                  </span>
                </FieldRow>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white px-5 py-5">
                <div className="text-base font-extrabold text-zinc-900">
                  Acompanhamento / Follow-up
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-zinc-500">Responsável:</div>
                    <div className="inline-flex w-full items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-extrabold text-zinc-800">
                      {defaults.responsible}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-zinc-500">Última atualização:</div>
                    <div className="inline-flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-extrabold text-zinc-800">
                      <CalendarDays className="h-4 w-4 text-zinc-500" />
                      {defaults.lastUpdated || "—"}
                    </div>
                  </div>

                  <div className="space-y-3 lg:col-span-2">
                    <div className="text-sm font-semibold text-zinc-500">Última ação realizada:</div>
                    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800">
                      {defaults.lastAction || "—"}
                    </div>
                  </div>

                  <div className="space-y-3 lg:col-span-2">
                    <div className="text-sm font-semibold text-zinc-500">Próxima ação prevista:</div>
                    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800">
                      {defaults.nextAction || "—"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-zinc-500">
                      Data prevista da próxima ação:
                    </div>
                    <div className="inline-flex h-11 w-full items-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800">
                      {defaults.nextDate || "—"}
                    </div>
                  </div>

                  <div className="space-y-3 lg:col-span-2">
                    <div className="text-sm font-semibold text-zinc-500">Observações internas:</div>
                    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800">
                      {defaults.notes || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white px-5 py-5">
                <div className="text-base font-extrabold text-zinc-900">
                  Histórico de Interações
                </div>
                <div className="mt-3 space-y-3">
                  {defaults.history.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
                        <Clock className="h-4 w-4" />
                      </span>
                      <span className="text-zinc-500">{h.date}</span>
                      <span className="text-zinc-300">-</span>
                      <span className="min-w-0 truncate">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

          <div className="border-t border-zinc-100 bg-white px-6 py-5">
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-2xl px-7 font-extrabold"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

