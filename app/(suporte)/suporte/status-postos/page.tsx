import type { Metadata } from "next";
import SuporteStatusPostosClient from "@/app/(suporte)/suporte/status-postos/ui/suporte-status-postos-client";

export const metadata: Metadata = {
  title: "Status dos Postos | Suporte | Frota+",
};

export default function Page() {
  return <SuporteStatusPostosClient />;
}

