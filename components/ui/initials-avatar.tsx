"use client";

import { useMemo } from "react";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsFrom(nameOrEmail: string) {
  const raw = (nameOrEmail || "").trim();
  if (!raw) return "--";
  const base = raw.includes("@") ? raw.split("@")[0] : raw;
  const parts = base.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "-";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1] ?? "";
  return `${a}${b}`.toUpperCase();
}

const GRADIENTS = [
  "bg-linear-to-br from-emerald-500 to-teal-600",
  "bg-linear-to-br from-blue-500 to-indigo-600",
  "bg-linear-to-br from-violet-500 to-fuchsia-600",
  "bg-linear-to-br from-rose-500 to-orange-500",
  "bg-linear-to-br from-amber-500 to-red-500",
  "bg-linear-to-br from-cyan-500 to-sky-600",
  "bg-linear-to-br from-zinc-700 to-zinc-900",
] as const;

export default function InitialsAvatar({
  name,
  size = 40,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const { initials, gradient } = useMemo(() => {
    const seed = hashSeed(name || "user");
    const idx = seed % GRADIENTS.length;
    return { initials: initialsFrom(name), gradient: GRADIENTS[idx] };
  }, [name]);

  return (
    <div
      className={[
        "inline-flex items-center justify-center overflow-hidden rounded-full text-white shadow-sm",
        gradient,
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label={`Avatar de ${name}`}
      title={name}
    >
      <span className="text-sm font-extrabold tracking-wide">{initials}</span>
    </div>
  );
}

