import type { Metadata } from "next";
import SuporteConfiguracoesClient from "@/app/(suporte)/suporte/configuracoes/ui/suporte-configuracoes-client";

export const metadata: Metadata = {
  title: "Configurações | Suporte | Frota+",
};

export default function Page() {
  return <SuporteConfiguracoesClient />;
}

