import { apiFetch } from "@/app/lib/api/api-client";

export type ApiStation = {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ListStationsParams = {
  province?: string;
  city?: string;
  include_inactive?: boolean;
};

export async function listStations(params?: ListStationsParams) {
  const qs = new URLSearchParams();
  if (params?.province) qs.set("province", params.province);
  if (params?.city) qs.set("city", params.city);
  if (typeof params?.include_inactive === "boolean") {
    qs.set("include_inactive", params.include_inactive ? "true" : "false");
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ApiStation[]>(`/stations/${suffix}`);
}

export type CreateStationBody = {
  name: string;
  address: string;
  province: string;
  city: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
};

export async function createStation(body: CreateStationBody) {
  return apiFetch<ApiStation>("/stations/create/", { method: "POST", body });
}

export type StationAuditStatus = "all" | "pending" | "regularized";

export type AuditAttachment = {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
};

export type AuditTicket = {
  id: string;
  ticket_code: string;
  ticket_type: string;
  ticket_type_display: string;
  subject: string;
  description: string;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  impact: string;
  company: string;
  company_name: string;
  requested_by: string;
  requested_by_name: string;
  requested_by_email: string;
  assigned_to: string | null;
  attachments: AuditAttachment[];
  created_at: string;
  updated_at: string;
  assigned_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  resolution?: string | null;
};

export type StationAuditResponse = {
  station: ApiStation;
  total_volume: string;
  financial_impact: string;
  anomaly_risk: string;
  total_tickets: number;
  pending_tickets: number;
  regularized_tickets: number;
  tickets: AuditTicket[];
};

export async function getStationAudit(stationId: string, params?: { status?: StationAuditStatus }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<StationAuditResponse>(`/stations/${encodeURIComponent(stationId)}/audit/${suffix}`);
}

