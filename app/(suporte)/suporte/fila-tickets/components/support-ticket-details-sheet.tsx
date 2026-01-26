"use client";

import { useMemo } from "react";
import { CalendarDays, FileText, User } from "lucide-react";

import type { Ticket, TicketStatus } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function statusPill(status: TicketStatus) {
  if (status === "EM ANALISE") return "bg-amber-50 text-amber-800 border-amber-100";
  if (status === "ABERTO") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "CONCLUIDO") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-zinc-50 text-zinc-700 border-zinc-200";
}

function statusLabel(status: TicketStatus) {
  if (status === "EM ANALISE") return "EM ANÁLISE";
  if (status === "CONCLUIDO") return "CONCLUÍDO";
  if (status === "ATRIBUIDO") return "ATRIBUÍDO";
  return status;
}

function row(label: string, value: React.ReactNode) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-extrabold text-zinc-500">{label}</div>
      <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

export default function SupportTicketDetailsSheet({
  open,
  onOpenChange,
  ticket,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: Ticket | null;
}) {
  const history = useMemo(() => {
    if (!ticket) return [];
    const base = [
      {
        id: "h1",
        title: "Ticket Aberto",
        date: ticket.createdAt,
        time: "11:00:00 AM",
        text: "O pedido foi submetido no sistema.",
        dot: "bg-emerald-500",
      },
    ];
    if (ticket.status === "EM ANALISE" || ticket.status === "ATRIBUIDO" || ticket.status === "CONCLUIDO") {
      base.push({
        id: "h2",
        title: "Em Análise",
        date: ticket.createdAt,
        time: "12:30:00 PM",
        text: "Um gestor iniciou a análise do processo.",
        dot: "bg-blue-600",
      });
    }
    return base;
  }, [ticket]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[96vw] max-w-[700px] p-0">
        {/* A11y: Radix exige um Title para leitores de ecrã */}
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes do Ticket</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-100 px-6 py-5 pr-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-600">
                {ticket?.code ?? "—"}
              </span>
              <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${ticket ? statusPill(ticket.status) : "border-zinc-200 bg-zinc-50 text-zinc-600"}`}>
                {ticket ? statusLabel(ticket.status) : "—"}
              </span>
            </div>

            <div className="mt-3 text-xl font-extrabold text-zinc-900">
              {ticket?.subject ?? "Detalhes do Ticket"}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-6">
            {!ticket ? (
              <div className="text-sm font-semibold text-zinc-500">Sem dados.</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {row(
                    "Solicitante",
                    <>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500">
                        <User className="h-5 w-5" />
                      </span>
                      <span>{ticket.requester}</span>
                    </>,
                  )}
                  {row(
                    "Data Criação",
                    <>
                      <CalendarDays className="h-5 w-5 text-zinc-400" />
                      <span className="font-extrabold text-zinc-900">{ticket.createdAt}</span>
                    </>,
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/30 px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    Descrição
                  </div>
                  <div className="mt-2 text-sm font-semibold text-zinc-600">{ticket.description}</div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white px-5 py-5">
                  <div className="text-sm font-extrabold text-zinc-900">Dados Operacionais</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Viatura</div>
                      <div className="mt-2 inline-flex rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700">
                        {ticket.matricula ?? "N/A"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Tipo</div>
                      <div className="mt-2 text-sm font-extrabold text-zinc-800">
                        {ticket.requestTypeLabel ?? ticket.type}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Prioridade</div>
                      <div className="mt-2 text-sm font-extrabold text-zinc-800">{ticket.priority}</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Canal</div>
                      <div className="mt-2 text-sm font-extrabold text-zinc-800">App Frota+</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white px-5 py-5">
                  <div className="text-sm font-extrabold text-zinc-900">Histórico do Pedido</div>
                  <div className="mt-4 space-y-5">
                    {history.map((h) => (
                      <div key={h.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className={`h-3 w-3 rounded-full ${h.dot}`} />
                          <span className="mt-1 h-full w-px bg-zinc-100" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-zinc-900">{h.title}</div>
                          <div className="mt-0.5 text-xs font-semibold text-zinc-400">
                            {h.date}, {h.time}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-zinc-600">{h.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

