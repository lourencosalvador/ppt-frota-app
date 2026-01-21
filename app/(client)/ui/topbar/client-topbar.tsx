"use client";

import { Bell } from "lucide-react";

export default function ClientTopbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="text-base font-semibold text-zinc-900">{title}</div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-zinc-50"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-zinc-600" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}

