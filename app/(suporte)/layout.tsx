"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SESSION_STORAGE_KEY, type DemoSession } from "@/app/lib/demo-auth";
import SuporteDashboardShell from "@/app/(suporte)/ui/suporte-dashboard-shell";

export default function SuporteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        router.replace("/");
        return;
      }
      const parsed = JSON.parse(raw) as DemoSession;
      if (!parsed?.email) {
        router.replace("/");
        return;
      }
      if (parsed.role !== "support") {
        router.replace("/");
        return;
      }
      setSession(parsed);
    } catch {
      router.replace("/");
    }
  }, [router, pathname]);

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-zinc-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
            A carregar...
          </div>
        </div>
      </div>
    );
  }

  return <SuporteDashboardShell session={session}>{children}</SuporteDashboardShell>;
}

