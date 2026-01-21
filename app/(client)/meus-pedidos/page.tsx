import type { Metadata } from "next";
import MeusPedidosClient from "@/app/(client)/meus-pedidos/meus-pedidos-client";

export const metadata: Metadata = {
  title: "Meus Pedidos | Frota+",
  description: "Gestão de pedidos e tickets",
};

export default function MeusPedidosPage() {
  return <MeusPedidosClient />;
}
