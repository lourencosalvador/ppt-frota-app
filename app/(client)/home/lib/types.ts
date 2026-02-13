import type { LucideIcon } from "lucide-react";

export type StatCard = {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  badge?: { label: string; className: string };
  value: string;
  title: string;
  subtitle?: string;
};

export type HistoryItem = {
  title: string;
  meta: string;
  amount: string;
  amountClass: string;
  icon: LucideIcon;
  iconWrapClass: string;
  iconClass: string;
};
