"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-client";
import { login } from "@/app/lib/api/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Insere um email válido."),
  password: z.string().min(6, "A palavra-passe deve ter no mínimo 6 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;

const fieldBase =
  "h-12 w-full rounded-2xl border bg-white/10 px-4 text-base text-white outline-none transition placeholder:text-white/40 focus:ring-4";
const fieldOk = "border-white/15 focus:border-emerald-400 focus:ring-emerald-400/20";
const fieldErr = "border-red-400/60 focus:border-red-400 focus:ring-red-400/20";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    if (isLoading) return;

    const normalizedEmail = values.email;
    const password = values.password;

    setIsLoading(true);
    try {
      const session = await login(normalizedEmail, password);
      toast.success("Sessão iniciada com sucesso.");
      const dest =
        session.role === "admin" ? "/admin"
        : session.role === "gestor" ? "/gestor"
        : session.role === "support" ? "/suporte"
        : "/painel";
      router.push(dest);
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(e.message || "Falha ao iniciar sessão.");
      } else {
        toast.error("Falha ao iniciar sessão.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-white/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          placeholder="Email de acesso"
          aria-invalid={Boolean(errors.email)}
          className={`${fieldBase} ${errors.email ? fieldErr : fieldOk}`}
        />
        {errors.email?.message ? (
          <div className="text-xs font-semibold text-red-300">{errors.email.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-white/70">
          Palavra-passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            placeholder="Senha de Acesso"
            aria-invalid={Boolean(errors.password)}
            className={`${fieldBase} pr-24 ${errors.password ? fieldErr : fieldOk}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-semibold text-white/50 hover:text-white/80"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {errors.password?.message ? (
          <div className="text-xs font-semibold text-red-300">{errors.password.message}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-3">
        <Link
          href="/recuperar-senha"
          className="text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          Esqueci a senha
        </Link>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-9 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
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

    </form>
  );
}
