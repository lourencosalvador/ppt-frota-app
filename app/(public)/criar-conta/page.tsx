import type { Metadata } from "next";
import SignupClient from "@/app/(public)/criar-conta/signup-client";

export const metadata: Metadata = {
  title: "Criar conta | Frota+",
};

export default function Page() {
  return <SignupClient />;
}

