import { apiFetch } from "@/app/lib/api/api-client";

export type ReportsPeriod = "week" | "month" | "year";

export type SecurityActivity = {
  manager_approvals: number;
  uncommon_alerts: number;
  audit_status: string;
  audit_status_label: string;
  last_integrity_check: string;
};

export type PerformanceKpis = {
  average_cost_per_vehicle: string;
  estimated_savings: string;
  savings_label: string;
  fraud_reduction: string;
  active_drivers: number;
};

export type TopVehicleConsumption = {
  vehicle_registration: string;
  consumption_liters: string;
  total_cost: string;
  efficiency: string;
};

export type ReportsKpisResponse = {
  security_activity: SecurityActivity;
  performance_kpis: PerformanceKpis;
  top_vehicles_consumption: TopVehicleConsumption[];
};

export async function getReportsKpis(period: ReportsPeriod = "month") {
  const qs = new URLSearchParams();
  if (period) qs.set("period", period);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ReportsKpisResponse>(`/reports-kpis/${suffix}`);
}
