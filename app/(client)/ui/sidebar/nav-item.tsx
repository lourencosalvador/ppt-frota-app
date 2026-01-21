"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export default function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white",
        isActive && "bg-white/6 text-white",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-emerald-500" />
      )}
      <Icon className="h-4.5 w-4.5 text-zinc-400 group-hover:text-white" />
      <span>{label}</span>
    </Link>
  );
}

