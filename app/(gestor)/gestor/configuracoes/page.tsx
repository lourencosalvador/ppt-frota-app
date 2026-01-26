import type { Metadata } from "next";
import GestorConfiguracoesClient from "@/app/(gestor)/gestor/configuracoes/ui/gestor-configuracoes-client";

export const metadata: Metadata = {
  title: "Configurações | Frota+",
};

export default function GestorConfiguracoesPage() {
  return <GestorConfiguracoesClient />;
}

