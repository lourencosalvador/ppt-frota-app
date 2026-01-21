"use client";

import { Bell, Inbox } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type ClientNotification = {
  id: string;
  title: string;
  description?: string;
  timeLabel?: string;
  unread?: boolean;
};

export default function ClientTopbar({
  title,
  notifications = [],
}: {
  title: string;
  notifications?: ClientNotification[];
}) {
  const unreadCount = notifications.filter((n) => n.unread).length;
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="text-base font-semibold text-zinc-900">{title}</div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-zinc-50"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5 text-zinc-600" />
              {unreadCount > 0 ? (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[92vw] max-w-[420px] p-0">
            <SheetHeader>
              <div className="flex items-center justify-between gap-4">
                <SheetTitle>Notificações</SheetTitle>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                    {unreadCount} nova{unreadCount === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </SheetHeader>

            <div className="max-h-[calc(100vh-82px)] overflow-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-sm font-extrabold text-zinc-900">
                    Sem notificações
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-500">
                    Quando houver novidades, elas aparecem aqui.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {n.unread ? (
                              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" />
                            ) : (
                              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-zinc-200" />
                            )}
                            <div className="truncate text-sm font-extrabold text-zinc-900">
                              {n.title}
                            </div>
                          </div>
                          {n.description ? (
                            <div className="mt-1 text-sm font-medium text-zinc-500">
                              {n.description}
                            </div>
                          ) : null}
                        </div>
                        {n.timeLabel ? (
                          <div className="flex-none text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                            {n.timeLabel}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

