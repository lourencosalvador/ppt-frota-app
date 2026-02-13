"use client";

import type { TicketPriority } from "@/app/(client)/meus-pedidos/lib/mock-tickets";

const priorityConfig: Record<TicketPriority, { bg: string; text: string }> = {
  Urgente: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
  Alta: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  Normal: { bg: "bg-zinc-50 border-zinc-200", text: "text-zinc-600" },
  Baixa: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const c = priorityConfig[priority] ?? priorityConfig.Normal;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${c.bg} ${c.text}`}>
      {priority}
    </span>
  );
}
