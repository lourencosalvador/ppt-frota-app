export type TicketPriority = "Alta" | "Urgente" | "Normal" | "Baixa";
export type TicketStatus = "EM ANALISE" | "ABERTO" | "ATRIBUIDO" | "APROVADO" | "REJEITADO" | "CONCLUIDO";
export type TicketType = "PEDIDO CARTAO" | "ABASTECIMENTO MANUAL" | "SUPORTE" | "CARREGAMENTO" | "OUTRO";

export type TicketImpact = "Alto" | "Médio" | "Baixo";

export type Ticket = {
  id: string;
  code: string;
  subject: string;
  type: TicketType;
  requester: string;
  requesterRole: string;
  fleet?: string;
  priority: TicketPriority;
  impact?: TicketImpact;
  assignedTo?: string | null;
  status: TicketStatus;
  createdAt: string;
  description?: string;
  attachmentName?: string;
  requestTypeLabel?: string;
};
