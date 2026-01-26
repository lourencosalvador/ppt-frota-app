"use client";

import { Settings } from "lucide-react";

export default function SuporteConfiguracoesClient() {
  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Configurações</div>
            <div className="mt-1 text-sm font-semibold text-zinc-500">
              Preferências e parâmetros do módulo de suporte (em breve).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

