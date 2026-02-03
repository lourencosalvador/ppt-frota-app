import { apiFetch } from "@/app/lib/api/api-client";
import type { AuditTicket } from "@/app/lib/api/stations";

export async function justifySupportTicket(ticketId: string, body: { justification: string }) {
  return apiFetch<AuditTicket>(`/support/tickets/${encodeURIComponent(ticketId)}/justify/`, {
    method: "POST",
    body,
  });
}

