import type { Metadata } from "next";
import ColaboradorPostosClient from "@/app/(client)/postos/ui/colaborador-postos-client";

export const metadata: Metadata = {
  title: "Postos de Abastecimento | Frota+",
};

export default function Page() {
  return <ColaboradorPostosClient />;
}
