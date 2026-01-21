"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function SignupForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      nome.trim().length > 1 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      !isLoading
    );
  }, [nome, email, password, isLoading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    if (!canSubmit) {
      toast.error("Confere os dados (nome, email e palavra-passe).");
      return;
    }

    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    setIsLoading(false);

    toast.success("Conta criada (modo demo). Já podes iniciar sessão.");
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 w-full max-w-2xl space-y-5">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-semibold text-zinc-700">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: João Manuel"
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
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
        <p className="text-xs font-medium text-zinc-500">
          Nota: nesta fase, o login aceita apenas as duas contas de demo.
        </p>
      </div>

      <div className="flex items-center justify-between pt-3">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-600 hover:underline"
        >
          Voltar ao login
        </Link>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-9 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              A criar...
            </span>
          ) : (
            "Criar conta"
          )}
        </button>
      </div>
    </form>
  );
}

