"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label: string; color?: string }>
    children: React.ReactNode
  }
>(({ config, children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex w-full text-xs", className)}
      {...props}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: Object.entries(config)
            .map(
              ([key, value]) => `
            :root {
              --color-${key}: ${value.color};
            }
          `
            )
            .join("\n"),
        }}
      />
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children as any}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean
    className?: string
  }
>(({ active, payload, className }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-2 shadow-md",
        className
      )}
    >
      {payload.map((item) => (
        <div key={item.name} className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase text-zinc-500">
            {item.name}
          </span>
          <span className="text-sm font-bold text-zinc-900">{item.value} L</span>
        </div>
      ))}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
