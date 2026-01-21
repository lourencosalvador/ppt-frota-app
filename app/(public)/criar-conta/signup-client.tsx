"use client";

import AuthShell from "@/app/(public)/ui/auth-shell";
import SignupForm from "@/app/(public)/criar-conta/components/signup-form";
import SignupHeader from "@/app/(public)/criar-conta/components/signup-header";

export default function SignupClient() {
  return (
    <AuthShell rightAlt="Criar conta Frota+">
      <SignupHeader />
      <SignupForm />
    </AuthShell>
  );
}

