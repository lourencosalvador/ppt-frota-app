"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/app/(public)/ui/auth-shell";
import { ApiError } from "@/app/lib/api/api-client";
import { confirmPasswordReset, requestPasswordReset } from "@/app/lib/api/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

const fieldBase =
  "h-12 w-full rounded-2xl border bg-white/10 px-4 text-base text-white outline-none transition placeholder:text-white/40 focus:ring-4 border-white/15 focus:border-emerald-400 focus:ring-emerald-400/20";

export default function OtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function verify() {
    if (isLoading) return;

    if (code.length !== 6) {
      toast.error("Insere o código completo (6 dígitos).");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova palavra-passe deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset({ email, code, new_password: newPassword });
      toast.success("Senha redefinida com sucesso.");
      router.push("/");
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error("Falha ao confirmar o código.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resend() {
    if (!email) {
      toast.error("Email inválido.");
      return;
    }
    try {
      const res = await requestPasswordReset(email);
      if (res.code) toast.success(`Código reenviado. (Demo) OTP: ${res.code}`);
      else toast.success("Código reenviado.");
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error("Falha ao reenviar o código.");
    }
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Confirmar código
      </h1>
      <p className="mt-2 text-base font-medium text-white/60 sm:text-lg">
        {email
          ? `Enviámos um código para ${email}`
          : "Enviámos um código para o teu email"}
      </p>

      <div className="mt-8 w-full space-y-6">
        <div>
          <InputOTP
            value={code}
            onChange={(v) => setCode(digitsOnly(v))}
            maxLength={6}
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Código OTP"
          >
            <InputOTPGroup className="max-w-[240px] sm:max-w-[320px]">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="max-w-[240px] sm:max-w-[320px]">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-2">
          <label htmlFor="new_password" className="text-sm font-semibold text-white/70">
            Nova palavra-passe
          </label>
          <input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className={fieldBase}
          />
        </div>

        <div className="flex items-center justify-start gap-3 pt-2">
          <button
            type="button"
            onClick={verify}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-9 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A verificar...
              </span>
            ) : (
              "Confirmar"
            )}
          </button>

          <button
            type="button"
            onClick={resend}
            className="inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white/50 transition hover:bg-white/10 hover:text-white/80"
          >
            Reenviar código
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
