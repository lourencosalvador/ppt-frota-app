import type { Ticket } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import type { ApiTicket, TicketPriority, TicketStatus, TicketType } from "@/app/lib/api/tickets";

export function apiPriorityToUi(p: TicketPriority): Ticket["priority"] {
  if (p === "urgent") return "Urgente";
  if (p === "high") return "Alta";
  if (p === "low") return "Baixa";
  return "Normal";
}

export function apiStatusToUi(s: TicketStatus): Ticket["status"] {
  if (s === "in_analysis") return "EM ANALISE";
  if (s === "assigned") return "ATRIBUIDO";
  if (s === "resolved") return "CONCLUIDO";
  if (s === "closed") return "CONCLUIDO";
  if (s === "reopened") return "ABERTO";
  return "ABERTO";
}

export function apiTypeToUi(t: TicketType): Ticket["type"] {
  if (t === "card_request") return "PEDIDO CARTAO";
  if (t === "manual_refuel") return "ABASTECIMENTO MANUAL";
  if (t === "account_topup") return "CARREGAMENTO";
  if (t === "support") return "SUPORTE";
  return "OUTRO";
}

export function uiStatusToApi(status: Ticket["status"]): TicketStatus | undefined {
  if (status === "EM ANALISE") return "in_analysis";
  if (status === "ABERTO") return "open";
  if (status === "ATRIBUIDO") return "assigned";
  if (status === "APROVADO") return "resolved";
  if (status === "REJEITADO") return "closed";
  if (status === "CONCLUIDO") return "closed";
  return undefined;
}

export function uiTypeToApi(type: Ticket["type"]): TicketType {
  if (type === "PEDIDO CARTAO") return "card_request";
  if (type === "ABASTECIMENTO MANUAL") return "manual_refuel";
  if (type === "CARREGAMENTO") return "account_topup";
  if (type === "SUPORTE") return "support";
  return "other";
}

export function uiPriorityToApi(priority: Ticket["priority"]): TicketPriority {
  if (priority === "Urgente") return "urgent";
  if (priority === "Alta") return "high";
  if (priority === "Baixa") return "low";
  return "normal";
}

export function apiTicketToUi(ticket: ApiTicket, requesterRole = "Cliente"): Ticket {
  return {
    id: ticket.id,
    code: ticket.ticket_code,
    subject: ticket.subject,
    type: apiTypeToUi(ticket.ticket_type),
    requester: ticket.requested_by_name || ticket.requested_by_email,
    requesterRole,
    priority: apiPriorityToUi(ticket.priority),
    status: apiStatusToUi(ticket.status),
    createdAt: ticket.created_at.slice(0, 10),
    description: ticket.description,
    attachmentName: ticket.attachments?.[0]?.file_name,
    requestTypeLabel: ticket.ticket_type_display,
  };
}

