import type { Metadata } from "next";
import PostosParceirosClient from "@/app/(client)/postos-parceiros/postos-parceiros-client";

export const metadata: Metadata = {
  title: "Postos Parceiros | Frota+",
};

export default function Page() {
  return <PostosParceirosClient />;
}

