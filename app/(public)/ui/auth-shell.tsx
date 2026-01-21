"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthShell({
  children,
  rightAlt = "Ilustração",
}: {
  children: ReactNode;
  rightAlt?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-zinc-900">
      <div className="grid min-h-screen w-full md:grid-cols-2">
        <div className="flex min-h-screen flex-col px-8 py-10 sm:px-12 sm:py-12">
          <div>
            <Image
              src="/brand/logo.svg"
              alt="Frota+"
              width={180}
              height={56}
              priority
              className="h-auto w-[150px] sm:w-[180px]"
            />
          </div>

          <div className="flex flex-1 items-start pt-10 sm:pt-12">
            <div className="w-full">{children}</div>
          </div>
        </div>

        <div className="relative hidden min-h-screen items-center justify-center bg-emerald-500 md:flex">
          <div className="absolute inset-0">
            <div className="absolute left-16 top-24 h-72 w-72 rounded-full bg-white/20" />
            <div className="absolute bottom-16 right-20 h-80 w-80 rounded-full bg-white/18" />
          </div>

          <div className="relative flex w-full items-center justify-center px-12">
            <Image
              src="/brand/figure.svg"
              alt={rightAlt}
              width={560}
              height={560}
              priority
              className="h-auto w-full max-w-[560px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

