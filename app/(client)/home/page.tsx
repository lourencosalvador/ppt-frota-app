import type { Metadata } from "next";
import MeuPainelClient from "@/app/(client)/home/ui/meu-painel-client";

export const metadata: Metadata = {
  title: "Meu Painel | Frota+",
};

export default function Page() {
  return <MeuPainelClient />;
}

