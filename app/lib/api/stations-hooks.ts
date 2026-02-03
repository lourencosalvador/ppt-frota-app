"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStation,
  getStationAudit,
  listStations,
  type ApiStation,
  type CreateStationBody,
  type ListStationsParams,
  type StationAuditResponse,
  type StationAuditStatus,
} from "@/app/lib/api/stations";

export const stationsQueryKey = (params?: ListStationsParams) =>
  [
    "stations",
    params?.province ?? "",
    params?.city ?? "",
    params?.include_inactive ? "1" : "0",
  ] as const;

export function useStations(params?: ListStationsParams) {
  return useQuery({
    queryKey: stationsQueryKey(params),
    queryFn: () => listStations(params),
    staleTime: 60_000,
  });
}

export function useCreateStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateStationBody) => createStation(body),
    onSuccess: (created) => {
      const queries = qc.getQueriesData<ApiStation[]>({ queryKey: ["stations"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        qc.setQueryData<ApiStation[]>(key, [created, ...data]);
      }
    },
  });
}

export const stationAuditQueryKey = (stationId: string, status: StationAuditStatus) =>
  ["station-audit", stationId, status] as const;

export function useStationAudit(stationId: string | null, status: StationAuditStatus = "all") {
  return useQuery({
    queryKey: stationId ? stationAuditQueryKey(stationId, status) : ["station-audit", "none", status],
    queryFn: () => getStationAudit(stationId as string, { status }),
    enabled: Boolean(stationId),
    staleTime: 30_000,
  });
}

