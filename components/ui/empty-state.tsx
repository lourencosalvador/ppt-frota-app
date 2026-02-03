"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-100/60 bg-white p-10 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-600">
        <Icon className="h-7 w-7" />
      </div>
      <div className="mt-4 text-base font-extrabold text-zinc-900">{title}</div>
      {description ? (
        <div className="mx-auto mt-1 max-w-md text-sm font-semibold text-zinc-500">
          {description}
        </div>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button
            type="button"
            onClick={onAction}
            className="h-11 rounded-xl bg-emerald-600 px-6 font-extrabold hover:bg-emerald-700"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {footer ? <div className="mt-6 text-xs font-semibold text-zinc-400">{footer}</div> : null}
    </div>
  );
}

