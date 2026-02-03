"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-client";
import { getMe, mapUserTypeToRole } from "@/app/lib/api/auth";
import { getStoredSession, setStoredSession, type AppSession } from "@/app/lib/auth/session";
import SuporteDashboardShell from "@/app/(suporte)/ui/suporte-dashboard-shell";

export default function SuporteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AppSession | null>(() => getStoredSession());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        const next: AppSession = {
          email: me.email,
          name: me.name,
          role: mapUserTypeToRole(me.type),
          createdAt: Date.now(),
        };
        if (!mounted) return;
        if (next.role !== "support") {
          router.replace("/");
          return;
        }
        setStoredSession(next);
        setSession(next);
      } catch (e) {
        if (!mounted) return;
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/");
          return;
        }
        toast.error(e instanceof ApiError ? e.message : "Falha ao validar sessão.");
        router.replace("/");
      }
    })();
    return () => {
      mounted = false;
    };
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

