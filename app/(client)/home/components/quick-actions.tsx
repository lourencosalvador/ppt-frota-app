"use client";

import type { LucideIcon } from "lucide-react";

type Action = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  kind: "success" | "info" | "violet" | "danger";
};

function styles(kind: Action["kind"]) {
  switch (kind) {
    case "success":
      return {
        wrap: "bg-white border-emerald-100/10 shadow-[0_4px_20px_rgb(16,185,129,0.03)]",
        iconWrap: "bg-emerald-50 text-emerald-600",
        title: "text-zinc-800",
        subtitle: "text-zinc-500",
      };
    case "info":
      return {
        wrap: "bg-white border-blue-100/10 shadow-[0_4px_20px_rgb(59,130,246,0.03)]",
        iconWrap: "bg-blue-50 text-blue-600",
        title: "text-zinc-800",
        subtitle: "text-zinc-500",
      };
    case "violet":
      return {
        wrap: "bg-white border-violet-100/10 shadow-[0_4px_20px_rgb(139,92,246,0.03)]",
        iconWrap: "bg-violet-50 text-violet-600",
        title: "text-zinc-800",
        subtitle: "text-zinc-500",
      };
    case "danger":
      return {
        wrap: "bg-red-50 border-red-100/20 shadow-[0_4px_20px_rgb(239,68,68,0.03)]",
        iconWrap: "bg-white text-red-600",
        title: "text-red-700",
        subtitle: "text-red-600",
      };
  }
}

export default function QuickActions({ actions }: { actions: Action[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {actions.slice(0, 4).map((a, idx) => {
          const Icon = a.icon;
          const s = styles(a.kind);
          return (
            <button
              key={idx}
              className={`flex flex-col items-center justify-center rounded-2xl border p-5 transition-all hover:scale-[1.01] active:scale-[0.99] ${s.wrap}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.iconWrap}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className={`mt-3 text-xs font-bold ${s.title}`}>
                {a.title}
              </div>
              <div className={`text-[11px] font-semibold ${s.subtitle}`}>
                {a.subtitle}
              </div>
            </button>
          );
        })}
    </div>
  );
}
