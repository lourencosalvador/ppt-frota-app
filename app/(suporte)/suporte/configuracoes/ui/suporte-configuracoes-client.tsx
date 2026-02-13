"use client";

import ProfileSettings from "@/components/profile-settings";

export default function SuporteConfiguracoesClient() {
  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="rounded-2xl border border-zinc-100/60 bg-white px-6 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="text-lg font-extrabold text-zinc-900">Configurações</div>
        <div className="mt-1 text-sm font-semibold text-zinc-500">
          Gere o teu perfil e preferências do módulo de suporte.
        </div>
      </div>

      <div className="mt-6">
        <ProfileSettings />
      </div>
    </div>
  );
}
