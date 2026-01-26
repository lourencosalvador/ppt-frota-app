import type { Metadata } from "next";
import GestorContasCartoesClient from "@/app/(gestor)/gestor/contas-cartoes/ui/gestor-contas-cartoes-client";

export const metadata: Metadata = {
  title: "Contas & Cartões | Frota+",
};

export default function GestorContasCartoesPage() {
  return <GestorContasCartoesClient />;
}

