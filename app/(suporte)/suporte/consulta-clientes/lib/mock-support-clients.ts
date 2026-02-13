import type { FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";

export type SupportTicketStatus = "EM ANÁLISE" | "ABERTO" | "ATRIBUÍDO" | "APROVADO";

export type SupportTicketRow = {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  date: string;
  fuel?: FuelType;
};

export type SupportClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  nif: string;
  sinceYear: number;
  isActive: boolean;
  account: {
    label: string;
    balanceKz: number;
    iban: string;
  };
  cards: Array<{
    id: string;
    masked: string;
    validThru: string;
    balanceKz: number;
    status: "ACTIVE" | "BLOCKED";
  }>;
  recentTickets: SupportTicketRow[];
};
