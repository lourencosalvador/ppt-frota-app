"use client";

import type { TicketStatus } from "@/app/(client)/meus-pedidos/lib/mock-tickets";

const statusConfig: Record<TicketStatus, { bg: string; text: string }> = {
  "EM ANALISE": { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  ABERTO: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  ATRIBUIDO: { bg: "bg-zinc-50 border-zinc-200", text: "text-zinc-700" },
  APROVADO: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  REJEITADO: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
  CONCLUIDO: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const c = statusConfig[status] ?? statusConfig.ABERTO;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}
