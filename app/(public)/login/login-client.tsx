"use client";

import AuthShell from "@/app/(public)/ui/auth-shell";
import LoginForm from "@/app/(public)/login/components/login-form";
import LoginHeader from "@/app/(public)/login/components/login-header";

export default function LoginClient() {
  return (
    <AuthShell rightAlt="Gestão Frota+">
      <LoginHeader />
      <LoginForm />
    </AuthShell>
  );
}

