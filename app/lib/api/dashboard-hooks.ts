"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard, type DashboardPeriod } from "@/app/lib/api/dashboard";
import { getReportsKpis, type ReportsPeriod } from "@/app/lib/api/reports-kpis";

export function useDashboard(period: DashboardPeriod = "month") {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboard(period),
    staleTime: 30_000,
  });
}

export function useReportsKpis(period: ReportsPeriod = "month") {
  return useQuery({
    queryKey: ["reports-kpis", period],
    queryFn: () => getReportsKpis(period),
    staleTime: 30_000,
  });
}
