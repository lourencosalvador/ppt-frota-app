import type { TicketPriority } from "@/app/(client)/meus-pedidos/lib/mock-tickets";

function getPriorityStyles(priority: TicketPriority) {
  switch (priority) {
    case "Urgente":
      return "text-red-600";
    case "Alta":
      return "text-orange-600";
    case "Normal":
      return "text-blue-600";
    case "Baixa":
      return "text-zinc-500";
    default:
      return "text-zinc-600";
  }
}

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${getPriorityStyles(priority).replace('text-', 'bg-')}`} />
      <span className={`text-xs font-semibold ${getPriorityStyles(priority)}`}>
        {priority}
      </span>
    </div>
  );
}
