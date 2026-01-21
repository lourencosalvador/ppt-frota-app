"use client";

import { useEffect, useMemo, useState } from "react";

import { SESSION_STORAGE_KEY, type DemoSession } from "@/app/lib/demo-auth";
import ActivityCard from "@/app/(client)/home/components/activity-card";
import HistoryPanel from "@/app/(client)/home/components/history-panel";
import QuickActions from "@/app/(client)/home/components/quick-actions";
import StatCards from "@/app/(client)/home/components/stat-cards";
import UserSummaryCard from "@/app/(client)/home/components/user-summary-card";
import {
  historyItems,
  recentRequests,
  statCards,
  chartData,
  quickActions,
} from "@/app/(client)/home/lib/mock-data";

function getTodayLabel() {
  try {
    const d = new Date();
    return new Intl.DateTimeFormat("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
      .format(d)
      .toUpperCase();
  } catch {
    return "";
  }
}

export default function MeuPainelClient() {
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DemoSession;
      if (!parsed?.email) return;
      setSession(parsed);
    } catch {}
  }, []);

  const name = session?.name ?? "Motorista";
  const today = useMemo(() => getTodayLabel(), []);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* Top Section: Full Width */}
      <UserSummaryCard todayLabel={`${today}, 17 DE JANEIRO`} name={name} />
      
      <StatCards cards={statCards} />

      {/* Bottom Section: Two columns layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="text-amber-500 text-sm">⚡</span> Acesso Rápido
          </div>

          <QuickActions actions={quickActions} />

          <ActivityCard data={chartData} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="text-[13px] font-bold text-zinc-900">KZ 85.00</div>
          </div>

          <HistoryPanel items={historyItems} recentRequests={recentRequests} />
        </div>
      </div>
    </div>
  );
}
