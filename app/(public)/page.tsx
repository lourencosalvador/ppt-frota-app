import type { Metadata } from "next";
import LoginClient from "@/app/(public)/login/login-client";

export const metadata: Metadata = {
  title: "Login | Frota+",
};

export default function Page() {
  return <LoginClient />;
}

