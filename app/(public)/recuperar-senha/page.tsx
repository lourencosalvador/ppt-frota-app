import type { Metadata } from "next";
import RecoverPasswordClient from "@/app/(public)/recuperar-senha/recover-password-client";

export const metadata: Metadata = {
  title: "Recuperar senha | Frota+",
};

export default function Page() {
  return <RecoverPasswordClient />;
}

