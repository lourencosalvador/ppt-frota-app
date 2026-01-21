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

export const mockTickets: Ticket[] = [
  {
    id: "1",
    code: "TKT-2024-001",
    subject: "Solicitação Novo Cartão - Motorista João",
    type: "PEDIDO CARTAO",
    requester: "João Motorista",
    requesterRole: "Motorista",
    priority: "Alta",
    status: "EM ANALISE",
    createdAt: "2024-01-15",
    requestTypeLabel: "Pedido de Cartão Frota+",
    description: "Solicito um novo cartão Frota+ para o motorista João.",
  },
  {
    id: "2",
    code: "TKT-2024-002",
    subject: "Abastecimento Manual - Emergência",
    type: "ABASTECIMENTO MANUAL",
    requester: "João Motorista",
    requesterRole: "Motorista",
    priority: "Urgente",
    status: "ABERTO",
    createdAt: "2024-01-16",
    requestTypeLabel: "Abastecimento Manual",
    description: "Abastecimento manual em emergência, fora do fluxo normal.",
    matricula: "LD-22-33-AA",
  },
  {
    id: "3",
    code: "TKT-2024-004",
    subject: "Erro de Leitura Chip",
    type: "SUPORTE",
    requester: "João Motorista",
    requesterRole: "Motorista",
    priority: "Normal",
    status: "ATRIBUIDO",
    createdAt: "2024-01-17",
    requestTypeLabel: "Suporte",
    description: "Cartão com erro de leitura do chip no posto.",
  },
  {
    id: "4",
    code: "TKT-2024-006",
    subject: "Abastecimento Aprovado - Rotina",
    type: "ABASTECIMENTO MANUAL",
    requester: "João Motorista",
    requesterRole: "Motorista",
    priority: "Baixa",
    status: "APROVADO",
    createdAt: "2024-01-18",
    requestTypeLabel: "Abastecimento Manual",
    description: "Pedido de abastecimento manual aprovado para rotina.",
    matricula: "LD-22-33-AA",
  },
];
