import { apiFetch } from "@/app/lib/api/api-client";

export type TicketStatus = "open" | "in_analysis" | "assigned" | "resolved" | "closed" | "reopened";
export type TicketType = "card_request" | "manual_refuel" | "account_topup" | "support" | "other";
export type TicketPriority = "urgent" | "high" | "normal" | "low";

export type TicketAttachment = {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
};

export type ApiTicket = {
  id: string;
  ticket_code: string;
  ticket_type: TicketType;
  ticket_type_display: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  priority_display: string;
  status: TicketStatus;
  status_display: string;
  impact: string;
  company: string;
  company_name: string;
  requested_by: string;
  requested_by_name: string;
  requested_by_email: string;
  assigned_to: string | null;
  attachments: TicketAttachment[];
  created_at: string;
  updated_at: string;
  assigned_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  resolution?: string | null;
};

export type ListTicketsParams = Partial<{
  status: TicketStatus;
  ticket_type: TicketType;
  priority: TicketPriority;
  search: string;
  page: number;
  page_size: number;
}>;

function normalizeTicketsPayload(payload: unknown): ApiTicket[] {
  if (Array.isArray(payload)) return payload as ApiTicket[];
  if (!payload || typeof payload !== "object") return [];
  const anyPayload = payload as Record<string, unknown>;

  const candidates = [
    anyPayload.results,
    anyPayload.data,
    anyPayload.items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as ApiTicket[];
  }
  return [];
}

export async function listTickets(params?: ListTicketsParams) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.ticket_type) qs.set("ticket_type", params.ticket_type);
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.search) qs.set("search", params.search);
  if (typeof params?.page === "number") qs.set("page", String(params.page));
  if (typeof params?.page_size === "number") qs.set("page_size", String(params.page_size));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const payload = await apiFetch<unknown>(`/tickets/${suffix}`);
  return normalizeTicketsPayload(payload);
}

export function createTicket(form: FormData) {
  return apiFetch<ApiTicket>("/tickets/create/", { method: "POST", body: form });
}

export function getTicket(ticketId: string) {
  return apiFetch<ApiTicket>(`/tickets/${encodeURIComponent(ticketId)}/`);
}

export type UpdateTicketBody = Partial<{
  subject: string;
  description: string;
  priority: TicketPriority;
}>;

export function updateTicketPut(ticketId: string, body: UpdateTicketBody) {
  return apiFetch<ApiTicket>(`/tickets/${encodeURIComponent(ticketId)}/`, { method: "PUT", body });
}

export function updateTicketPatch(ticketId: string, body: UpdateTicketBody) {
  return apiFetch<ApiTicket>(`/tickets/${encodeURIComponent(ticketId)}/`, { method: "PATCH", body });
}

export function deleteTicket(ticketId: string) {
  return apiFetch<void>(`/tickets/${encodeURIComponent(ticketId)}/`, { method: "DELETE" });
}

