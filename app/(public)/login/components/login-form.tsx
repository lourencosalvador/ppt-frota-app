"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getDemoUserByEmail,
  SESSION_STORAGE_KEY,
  type DemoSession,
  validateDemoCredentials,
} from "@/app/lib/demo-auth";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isLoading;
  }, [email, password, isLoading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error("Preenche o email e a palavra-passe.");
      return;
    }

    setIsLoading(true);
    await sleep(5000);

    const ok = validateDemoCredentials(normalizedEmail, password);
    if (!ok) {
      setIsLoading(false);
      toast.error("Email ou palavra-passe inválidos.");
      return;
    }

    const profile = getDemoUserByEmail(normalizedEmail);
    const session: DemoSession = {
      email: normalizedEmail,
      name: profile?.name ?? normalizedEmail,
      role: profile?.role ?? "client",
      createdAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    toast.success("Sessão iniciada com sucesso.");
    router.push("/home");
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 w-full max-w-2xl space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: nome@empresa.com"
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-zinc-700">
          Palavra-passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-24 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href="/recuperar-senha"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          Esqueci a senha
        </Link>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-9 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              A entrar...
            </span>
          ) : (
            "Iniciar Sessão"
          )}
        </button>
      </div>

      <div className="pt-3 text-sm text-zinc-600">
        Ainda não tens conta?{" "}
        <Link
          href="/criar-conta"
          className="font-semibold text-emerald-700 hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </form>
  );
}

