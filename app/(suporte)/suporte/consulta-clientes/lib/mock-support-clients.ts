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

export const supportClientsMock: SupportClient[] = [
  {
    id: "sc-1",
    name: "João Motorista",
    email: "joao.silva@frota.plus",
    phone: "+244 920 457 890",
    company: "Frota Norte Distribuição Lda",
    nif: "254123789",
    sinceYear: 2023,
    isActive: true,
    account: {
      label: "CONTA PRINCIPAL",
      balanceKz: 15420,
      iban: "AO06 0044 0000 4567 8901 2",
    },
    cards: [
      {
        id: "card-1",
        masked: "**** **** **** 4829",
        validThru: "12/26",
        balanceKz: 805,
        status: "ACTIVE",
      },
    ],
    recentTickets: [
      {
        id: "TKT-2024-001",
        subject: "Solicitação Novo Cartão - Motorista João",
        status: "EM ANÁLISE",
        date: "5/20/2024",
      },
      {
        id: "TKT-2024-002",
        subject: "Abastecimento Manual - Emergência",
        status: "ABERTO",
        date: "5/21/2024",
        fuel: "Diesel",
      },
      {
        id: "TKT-2024-004",
        subject: "Erro de Leitura Chip",
        status: "ATRIBUÍDO",
        date: "5/21/2024",
      },
      {
        id: "TKT-2024-006",
        subject: "Abastecimento Aprovado - Rotina",
        status: "APROVADO",
        date: "5/15/2024",
      },
    ],
  },
  {
    id: "sc-2",
    name: "Maria Santos",
    email: "maria.santos@logistica.pt",
    phone: "+244 923 111 222",
    company: "Logística Atlântica",
    nif: "245998771",
    sinceYear: 2022,
    isActive: true,
    account: {
      label: "CONTA PRINCIPAL",
      balanceKz: 8030.5,
      iban: "AO06 0044 0000 1234 5678 9",
    },
    cards: [
      {
        id: "card-2",
        masked: "**** **** **** 9901",
        validThru: "08/27",
        balanceKz: 120.25,
        status: "ACTIVE",
      },
      {
        id: "card-3",
        masked: "**** **** **** 1180",
        validThru: "11/25",
        balanceKz: 0,
        status: "BLOCKED",
      },
    ],
    recentTickets: [
      {
        id: "TKT-2024-011",
        subject: "Reemissão de PIN",
        status: "ATRIBUÍDO",
        date: "6/01/2024",
      },
      {
        id: "TKT-2024-014",
        subject: "Limite de Abastecimento",
        status: "APROVADO",
        date: "6/03/2024",
      },
    ],
  },
  {
    id: "sc-3",
    name: "Pedro Costa",
    email: "pedro.costa@transporte.pt",
    phone: "+244 924 333 444",
    company: "Transporte Sul",
    nif: "221009991",
    sinceYear: 2021,
    isActive: false,
    account: {
      label: "CONTA PRINCIPAL",
      balanceKz: 0,
      iban: "AO06 0044 0000 0000 0000 0",
    },
    cards: [],
    recentTickets: [
      {
        id: "TKT-2024-020",
        subject: "Bloqueio de Conta - Verificação",
        status: "ABERTO",
        date: "6/10/2024",
      },
    ],
  },
];

