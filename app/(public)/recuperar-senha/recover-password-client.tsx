"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/app/(public)/ui/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecoverPasswordClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Preenche o email.");
      return;
    }

    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setIsLoading(false);

    toast.success("Código enviado. Confere o teu email (demo).");
    router.push(`/recuperar-senha/otp?email=${encodeURIComponent(normalizedEmail)}`);
  }

  return (
    <AuthShell rightAlt="Recuperar senha Frota+">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
        Recuperar senha
      </h1>
      <p className="mt-3 text-lg font-medium text-zinc-500 sm:text-xl">
        Vamos enviar um código para confirmares a tua conta
      </p>

      <form onSubmit={onSubmit} className="mt-10 w-full max-w-2xl space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: nome@empresa.com"
          />
        </div>

        <div className="flex items-center justify-end pt-3">
          <Button type="submit" disabled={isLoading || email.trim().length === 0}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A enviar...
              </span>
            ) : (
              "Enviar código"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

