export type TicketPriority = "Alta" | "Urgente" | "Normal" | "Baixa";
export type TicketStatus = "EM ANALISE" | "ABERTO" | "ATRIBUIDO" | "APROVADO" | "REJEITADO" | "CONCLUIDO";
export type TicketType = "PEDIDO CARTAO" | "ABASTECIMENTO MANUAL" | "SUPORTE" | "CARREGAMENTO" | "OUTRO";

export type Ticket = {
  id: string;
  code: string;
  subject: string;
  type: TicketType;
  requester: string;
  requesterRole: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  description?: string;
  matricula?: string;
  attachmentName?: string;
  requestTypeLabel?: string;
};
