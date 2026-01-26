import type { Metadata } from "next";
import SuporteConsultaClientesClient from "@/app/(suporte)/suporte/consulta-clientes/ui/suporte-consulta-clientes-client";

export const metadata: Metadata = {
  title: "Consulta Clientes | Suporte | Frota+",
};

export default function Page() {
  return <SuporteConsultaClientesClient />;
}

