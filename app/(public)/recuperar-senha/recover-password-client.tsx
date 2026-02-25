"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/app/(public)/ui/auth-shell";
import { ApiError } from "@/app/lib/api/api-client";
import { requestPasswordReset } from "@/app/lib/api/auth";

const fieldBase =
  "h-12 w-full rounded-2xl border bg-white/10 px-4 text-base text-white outline-none transition placeholder:text-white/40 focus:ring-4 border-white/15 focus:border-emerald-400 focus:ring-emerald-400/20";

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
    try {
      const res = await requestPasswordReset(normalizedEmail);
      if (res.code) {
        toast.success(`Código enviado. (Demo) OTP: ${res.code}`);
      } else {
        toast.success("Código enviado. Confere o teu email.");
      }
      router.push(`/recuperar-senha/otp?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error("Falha ao enviar o código.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Recuperar senha
      </h1>
      <p className="mt-2 text-base font-medium text-white/60 sm:text-lg">
        Vamos enviar um código para confirmares a tua conta
      </p>

      <form onSubmit={onSubmit} className="mt-8 w-full space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-white/70">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: nome@empresa.com"
            className={fieldBase}
          />
        </div>

        <div className="flex items-center justify-between pt-3">
          <Link
            href="/"
            className="text-sm font-semibold text-white/50 transition hover:text-white/80"
          >
            Voltar ao login
          </Link>

          <button
            type="submit"
            disabled={isLoading || email.trim().length === 0}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-9 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A enviar...
              </span>
            ) : (
              "Enviar código"
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
