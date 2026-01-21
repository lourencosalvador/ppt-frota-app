"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

function hasUppercase(v: string) {
  return /[A-Z]/.test(v);
}

function hasNumberOrSpecial(v: string) {
  return /[0-9]/.test(v) || /[^a-zA-Z0-9]/.test(v);
}

const signupSchema = z.object({
  nome: z.string().trim().min(2, "Insere o teu nome."),
  email: z.string().trim().toLowerCase().email("Insere um email válido."),
  password: z
    .string()
    .min(6, "A palavra-passe deve ter no mínimo 6 caracteres.")
    .refine((v) => hasUppercase(v), "Deve conter pelo menos 1 letra maiúscula.")
    .refine((v) => hasNumberOrSpecial(v), "Deve conter números ou caracteres especiais."),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { nome: "", email: "", password: "" },
  });

  const password = watch("password") ?? "";
  const rules = useMemo(() => {
    const r1 = password.length >= 6;
    const r2 = hasUppercase(password);
    const r3 = hasNumberOrSpecial(password);
    return [
      { id: "len", label: "Mínimo 6 caracteres", ok: r1 },
      { id: "up", label: "1 letra maiúscula", ok: r2 },
      { id: "num", label: "Números ou caracteres especiais", ok: r3 },
    ] as const;
  }, [password]);

  const progress = useMemo(() => {
    const okCount = rules.filter((r) => r.ok).length;
    return okCount / rules.length;
  }, [rules]);

  const progressClasses = useMemo(() => {
    if (progress < 0.34) return "bg-red-500";
    if (progress < 1) return "bg-amber-500";
    return "bg-emerald-600";
  }, [progress]);

  async function onSubmit() {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    setIsLoading(false);
    toast.success("Conta criada (modo demo). Já podes iniciar sessão.");
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 w-full max-w-2xl space-y-5">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-semibold text-zinc-700">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          {...register("nome")}
          placeholder="Ex: Lorrys Manuel"
          aria-invalid={Boolean(errors.nome)}
          className={[
            "h-12 w-full rounded-2xl border bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4",
            errors.nome
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
              : "border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/15",
          ].join(" ")}
        />
        {errors.nome?.message ? (
          <div className="text-xs font-semibold text-red-600">{errors.nome.message}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          placeholder="ex: nome@empresa.com"
          aria-invalid={Boolean(errors.email)}
          className={[
            "h-12 w-full rounded-2xl border bg-white px-4 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4",
            errors.email
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
              : "border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/15",
          ].join(" ")}
        />
        {errors.email?.message ? (
          <div className="text-xs font-semibold text-red-600">{errors.email.message}</div>
        ) : null}
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
            {...register("password")}
            placeholder="mínimo 6 caracteres"
            aria-invalid={Boolean(errors.password)}
            className={[
              "h-12 w-full rounded-2xl border bg-white px-4 pr-24 text-base outline-none transition placeholder:text-zinc-400 focus:ring-4",
              errors.password
                ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
                : "border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/15",
            ].join(" ")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">
              Força da senha
            </div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">
              {Math.round(progress * 100)}%
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <motion.div
              className={`h-2 ${progressClasses}`}
              initial={false}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-700">{r.label}</div>
                <motion.div
                  initial={false}
                  animate={{ scale: r.ok ? 1 : 0.95, opacity: r.ok ? 1 : 0.6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={[
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border",
                    r.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-white text-zinc-500",
                  ].join(" ")}
                >
                  {r.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {errors.password?.message ? (
          <div className="text-xs font-semibold text-red-600">{errors.password.message}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-3">
        <Link href="/" className="text-sm font-semibold text-zinc-600 hover:underline">
          Voltar ao login
        </Link>

        <button
          type="submit"
          disabled={!isValid || isLoading}
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

