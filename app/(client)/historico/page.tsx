import type { Metadata } from "next";
import HistoricoAbastecimentosClient from "@/app/(client)/historico/ui/historico-abastecimentos-client";

export const metadata: Metadata = {
  title: "Histórico de Abastecimentos | Frota+",
};

export default function Page() {
  return <HistoricoAbastecimentosClient />;
}
