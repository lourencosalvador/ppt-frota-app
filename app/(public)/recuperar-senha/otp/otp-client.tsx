"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/app/(public)/ui/auth-shell";
import { ApiError } from "@/app/lib/api/api-client";
import { confirmPasswordReset, requestPasswordReset } from "@/app/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

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
    <AuthShell rightAlt="Confirmação OTP Frota+">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
        Confirmar código
      </h1>
      <p className="mt-3 text-lg font-medium text-zinc-500 sm:text-xl">
        {email
          ? `Enviámos um código para ${email}`
          : "Enviámos um código para o teu email"}
      </p>

      <div className="mt-10 w-full max-w-2xl space-y-6">
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
          <Label htmlFor="new_password">Nova palavra-passe</Label>
          <Input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
          />
        </div>

        <div className="flex items-center justify-start gap-3 pt-4">
          <Button type="button" onClick={verify} disabled={isLoading}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A verificar...
              </span>
            ) : (
              "Confirmar"
            )}
          </Button>

          <Button type="button" variant="ghost" onClick={resend}>
            Reenviar código
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

