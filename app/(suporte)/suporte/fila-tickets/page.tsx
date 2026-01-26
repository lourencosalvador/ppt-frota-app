import type { Metadata } from "next";
import GestorTicketsClient from "@/app/(gestor)/gestor/tickets/ui/gestor-tickets-client";

export const metadata: Metadata = {
  title: "Fila de Tickets | Suporte | Frota+",
};

export default function Page() {
  return <GestorTicketsClient creatorName="Equipa Suporte" creatorRole="Suporte" detailsVariant="support" />;
}

