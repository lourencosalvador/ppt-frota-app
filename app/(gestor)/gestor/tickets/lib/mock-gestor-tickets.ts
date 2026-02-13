import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";

export type GestorTicket = Ticket & {
  requesterId?: string;
  requesterName: string;
};
