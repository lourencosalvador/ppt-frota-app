import type { StatCard } from "@/app/(client)/home/lib/mock-data";

function getCardStyles(iconClass: string) {
  if (iconClass.includes("text-blue-700")) return "shadow-[0_4px_20px_rgb(59,130,246,0.04)] border-blue-100/10";
  if (iconClass.includes("text-emerald-700")) return "shadow-[0_4px_20px_rgb(16,185,129,0.04)] border-emerald-100/10";
  if (iconClass.includes("text-amber-700")) return "shadow-[0_4px_20px_rgb(245,158,11,0.04)] border-amber-100/10";
  if (iconClass.includes("text-violet-700")) return "shadow-[0_4px_20px_rgb(139,92,246,0.04)] border-violet-100/10";
  return "shadow-sm border-zinc-100";
}

export default function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const themeStyles = getCardStyles(c.iconClass);
        
        return (
          <div
            key={idx}
            className={`rounded-2xl border bg-white p-5 transition-all ${themeStyles}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBgClass} ${c.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {c.badge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.badge.className}`}
                >
                  {c.badge.label}
                </span>
              ) : null}
            </div>
            <div className="mt-5 text-xl font-extrabold text-zinc-900">
              {c.value}
            </div>
            <div className="mt-1 text-xs font-semibold text-zinc-500">
              {c.title}
            </div>
            {c.subtitle ? (
              <div className="mt-1 text-[10px] font-medium text-zinc-300">
                {c.subtitle}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
