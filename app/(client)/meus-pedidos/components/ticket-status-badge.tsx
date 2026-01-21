import type { TicketStatus } from "@/app/(client)/meus-pedidos/lib/mock-tickets";

function getStatusStyles(status: TicketStatus) {
  switch (status) {
    case "EM ANALISE":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "ABERTO":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "ATRIBUIDO":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "APROVADO":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REJEITADO":
      return "bg-red-50 text-red-700 border-red-100";
    case "CONCLUIDO":
      return "bg-violet-50 text-violet-700 border-violet-100";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-100";
  }
}

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  );
}
