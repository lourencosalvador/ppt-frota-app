import type { Metadata } from "next";
import GestorPostosAbastecClient from "@/app/(gestor)/gestor/postos-abastec/ui/gestor-postos-abastec-client";

export const metadata: Metadata = {
  title: "Postos & Abastec. | Frota+",
};

export default function GestorPostosPage() {
  return <GestorPostosAbastecClient />;
}

