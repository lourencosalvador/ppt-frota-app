"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/app/(public)/ui/auth-shell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const DEMO_OTP = "123456";

export default function OtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function verify() {
    if (isLoading) return;

    if (code.length !== 6) {
      toast.error("Insere o código completo (6 dígitos).");
      return;
    }

    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    setIsLoading(false);

    if (code !== DEMO_OTP) {
      toast.error("Código inválido. Tenta novamente.");
      return;
    }

    toast.success("Código confirmado com sucesso.");
    router.push("/");
  }

  function resend() {
    toast.success("Código reenviado (demo). Usa 123456.");
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
            onChange={(v) => setCode(v.replace(/\D/g, ""))}
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
          <p className="mt-3 text-sm font-medium text-zinc-500">
            Demo: usa <span className="font-semibold text-zinc-800">123456</span>
          </p>
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

