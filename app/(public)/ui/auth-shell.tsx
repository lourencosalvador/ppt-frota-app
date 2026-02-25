"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import bgLogin from "@/app/assets/image/fundo-login.png";

export default function AuthShell({
  children,
}: {
  children: ReactNode;
  rightAlt?: string;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center font-sans">
      {/* Full-bleed background */}
      <Image
        src={bgLogin}
        alt=""
        fill
        priority
        placeholder="blur"
        className="object-cover"
        quality={90}
      />

      {/* Subtle dark vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent" />

      {/* Content card — glass morphism */}
      <div className="relative z-10 flex w-full max-w-[520px] flex-col px-5 py-10 sm:px-0">
        <div className="rounded-3xl border border-white/[0.08] bg-black/35 px-8 py-10 shadow-2xl backdrop-blur-2xl sm:px-12 sm:py-12">
          {/* Logo */}
          <div className="mb-10">
            <Image
              src="/brand/logo.svg"
              alt="Frota+"
              width={180}
              height={56}
              priority
              className="h-auto w-[140px] drop-shadow-lg sm:w-[160px]"
            />
          </div>

          {/* Page-specific content */}
          <div className="w-full">{children}</div>
        </div>

        {/* Footer attribution */}
        <div className="mt-6 text-center text-[11px] font-semibold text-white/40">
          Frota+ by Pumangol &mdash; Sistema de Gestão de Frotas
        </div>
      </div>
    </div>
  );
}
