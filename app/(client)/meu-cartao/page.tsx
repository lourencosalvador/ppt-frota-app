import type { Metadata } from "next";
import MeusCartoesClient from "@/app/(client)/meu-cartao/meus-cartoes-client";

export const metadata: Metadata = {
  title: "Meu Cartão | Frota+",
};

export default function Page() {
  return <MeusCartoesClient />;
}
