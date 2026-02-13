import InitialsAvatar from "@/components/ui/initials-avatar";

export default function UserSummaryCard({
  todayLabel,
  name,
  companyName,
  vehicleRegistration,
}: {
  todayLabel: string;
  name: string;
  companyName?: string;
  vehicleRegistration?: string;
}) {
  return (
    <section className="rounded-2xl border border-blue-100/10 bg-white p-6 shadow-[0_4px_20px_rgb(59,130,246,0.03)]">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <InitialsAvatar name={name} size={48} className="border border-blue-100/30" />
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
                Cliente Ativo
              </span>
              {companyName ? (
                <span className="text-[11px] font-medium text-zinc-400">
                  • {companyName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {vehicleRegistration ? (
          <div className="text-right">
            <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Viatura Principal
            </div>
            <div className="mt-0.5 text-sm font-bold text-zinc-900">
              {vehicleRegistration}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
