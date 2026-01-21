"use client";

import type { HistoryItem } from "@/app/(client)/home/lib/mock-data";

export default function HistoryPanel({
  items,
  recentRequests,
}: {
  items: HistoryItem[];
  recentRequests: { title: string; status: string }[];
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-100/50 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">Histórico Recente</h3>
          <button className="text-zinc-400 transition-colors hover:text-zinc-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${it.iconWrapClass}`}
                  >
                    <Icon className={`h-5 w-5 ${it.iconClass}`} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-900 leading-tight">
                      {it.title}
                    </div>
                    <div className="text-[10px] font-medium text-zinc-400">
                      {it.meta}
                    </div>
                  </div>
                </div>
                <div className={`text-[11px] font-bold ${it.amountClass}`}>
                  {it.amount}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-50 p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Solicitações recentes
        </h3>
        <div className="mt-4 space-y-4">
          {recentRequests.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === 1 ? "bg-blue-600" : "bg-zinc-300"
                  }`}
                />
                <span className="text-[11px] font-bold text-zinc-500">
                  {r.title}
                </span>
              </div>
              <span className="text-[9px] font-bold tracking-tighter text-zinc-400">
                {r.status}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-8 w-full text-center text-[11px] font-bold text-blue-600 hover:underline">
          Ver extrato completo →
        </button>
      </div>
    </div>
  );
}
