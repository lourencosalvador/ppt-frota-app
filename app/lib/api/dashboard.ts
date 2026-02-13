import { apiFetch } from "@/app/lib/api/api-client";

export type DashboardPeriod = "week" | "month" | "year";

export type DailyCost = {
  day: string;
  cost: string;
};

export type VolumeDistribution = {
  status: string;
  count: number;
  percentage: string;
};

export type DashboardResponse = {
  daily_costs: DailyCost[];
  volume_distribution: VolumeDistribution[];
  sla_performance: string;
  sla_performance_label: string;
  critical_tickets: number;
  critical_tickets_change: number;
  critical_tickets_risk: string;
  in_analysis_tickets: number;
  average_analysis_time: string;
  resolved_this_month: number;
  resolved_volume_change: string;
  approval_rate: string;
  cost_efficiency: string;
  cost_efficiency_status: string;
  market_average: string;
};

export async function getDashboard(period: DashboardPeriod = "month") {
  const qs = new URLSearchParams();
  if (period) qs.set("period", period);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<DashboardResponse>(`/dashboard/${suffix}`);
}
