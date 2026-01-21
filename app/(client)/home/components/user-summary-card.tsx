export default function UserSummaryCard({
  todayLabel,
  name,
}: {
  todayLabel: string;
  name: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <section className="rounded-2xl border border-blue-100/10 bg-white p-6 shadow-[0_4px_20px_rgb(59,130,246,0.03)]">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-zinc-400">
              {todayLabel}
            </div>
            <h1 className="mt-0.5 text-xl font-bold text-zinc-900 leading-tight">
              Olá, {name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Motorista Ativo
              </span>
              <span className="text-[11px] font-medium text-zinc-400">
                • Frota Norte Distribuição
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Viatura Principal
          </div>
          <div className="mt-0.5 text-sm font-bold text-zinc-900">
            LD-22-33-AA
          </div>
        </div>
      </div>
    </section>
  );
}
