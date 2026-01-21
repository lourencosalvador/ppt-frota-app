import type { Metadata } from "next";
import MeusCartoesClient from "@/app/(client)/meus-cartoes/meus-cartoes-client";

export const metadata: Metadata = {
  title: "Meus Cartões | Frota+",
};

export default function Page() {
  return <MeusCartoesClient />;
}

