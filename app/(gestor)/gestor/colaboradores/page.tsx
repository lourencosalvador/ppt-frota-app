import type { Metadata } from "next";
import GestorColaboradoresClient from "@/app/(gestor)/gestor/colaboradores/ui/gestor-colaboradores-client";

export const metadata: Metadata = {
  title: "Colaboradores | Frota+",
};

export default function Page() {
  return <GestorColaboradoresClient />;
}
