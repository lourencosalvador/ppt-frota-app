"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Consumo",
    color: "#2563eb",
  },
};

export default function ActivityCard({
  data,
}: {
  data: { day: string; value: number }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-100/50 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">
            Minha Atividade de Consumo
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Últimos 7 dias
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-3 w-3"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              d="M23 6l-9.5 9.5-5-5L1 18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Consumo Estável
        </span>
      </div>

      <div className="mt-4 h-[180px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={data}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#f1f1f1"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
            />
            <YAxis hide domain={[0, "dataMax + 10"]} />
            <ChartTooltip
              cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#fillValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
