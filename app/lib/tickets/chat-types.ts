export type ChatRole = "admin" | "support" | "gestor" | "system";

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: ChatRole;
  content: string;
  attachments?: string[];
  createdAt: string; // ISO string
  readAt?: string;
}

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  {
    id: "m1",
    ticketId: "t1",
    senderId: "u1",
    senderName: "Carlos Silva",
    senderRole: "gestor",
    content: "Bom dia. O cartão do motorista João bloqueou ao tentar abastecer no posto do Kilamba. Podem verificar?",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "m2",
    ticketId: "t1",
    senderId: "s1",
    senderName: "Suporte Frota+",
    senderRole: "support",
    content: "Olá Carlos. Estamos a analisar a situação. O bloqueio ocorreu devido a tentativas sucessivas de PIN incorreto.",
    createdAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: "m3",
    ticketId: "t1",
    senderId: "u1",
    senderName: "Carlos Silva",
    senderRole: "gestor",
    content: "Entendido. É possível desbloquear remotamente ou ele precisa de um novo cartão?",
    createdAt: new Date(Date.now() - 82000000).toISOString(),
  }
];
