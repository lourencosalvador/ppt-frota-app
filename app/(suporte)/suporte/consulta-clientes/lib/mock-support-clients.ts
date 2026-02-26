export type FleetCardStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED";

export type FleetCard = {
  id: string;
  uid: string;
  masked: string;
  assignedTo: string | null;
  assignedRole: string | null;
  balanceKz: number;
  limitKz: number;
  status: FleetCardStatus;
  validThru: string;
  lastUsed: string | null;
};

export type FleetUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  cardId: string | null;
  isActive: boolean;
  joinedAt: string;
};

export type Fleet = {
  id: string;
  name: string;
  nif: string;
  sector: string;
  totalCards: number;
  activeCards: number;
  totalUsers: number;
  isActive: boolean;
  users: FleetUser[];
  cards: FleetCard[];
};

export const MOCK_FLEETS: Fleet[] = [
  {
    id: "fleet-001",
    name: "Lainsa.Dev",
    nif: "5417281037",
    sector: "Tecnologia",
    totalCards: 4,
    activeCards: 3,
    totalUsers: 3,
    isActive: true,
    users: [
      { id: "u1", name: "Lorrys Marques", email: "lorrys@lainsa.dev", role: "Gestor", cardId: "c1", isActive: true, joinedAt: "2024-06-12" },
      { id: "u2", name: "Ana Costa", email: "ana.costa@lainsa.dev", role: "Colaborador", cardId: "c2", isActive: true, joinedAt: "2024-08-01" },
      { id: "u3", name: "Pedro Neto", email: "pedro@lainsa.dev", role: "Colaborador", cardId: null, isActive: false, joinedAt: "2025-01-15" },
    ],
    cards: [
      { id: "c1", uid: "FROTA00001234", masked: "**** **** **** 1234", assignedTo: "Lorrys Marques", assignedRole: "Gestor", balanceKz: 125000, limitKz: 200000, status: "ACTIVE", validThru: "12/27", lastUsed: "2026-01-28" },
      { id: "c2", uid: "FROTA00005678", masked: "**** **** **** 5678", assignedTo: "Ana Costa", assignedRole: "Colaborador", balanceKz: 45000, limitKz: 80000, status: "ACTIVE", validThru: "06/27", lastUsed: "2026-02-01" },
      { id: "c3", uid: "FROTA00009012", masked: "**** **** **** 9012", assignedTo: null, assignedRole: null, balanceKz: 0, limitKz: 50000, status: "BLOCKED", validThru: "03/26", lastUsed: null },
      { id: "c4", uid: "FROTA00003456", masked: "**** **** **** 3456", assignedTo: null, assignedRole: null, balanceKz: 80000, limitKz: 150000, status: "ACTIVE", validThru: "09/28", lastUsed: "2026-01-10" },
    ],
  },
  {
    id: "fleet-002",
    name: "Platina Lôse",
    nif: "5234560987",
    sector: "Logística",
    totalCards: 6,
    activeCards: 5,
    totalUsers: 4,
    isActive: true,
    users: [
      { id: "u4", name: "Maria Silva", email: "maria@platinalose.ao", role: "Gestor", cardId: "c5", isActive: true, joinedAt: "2024-03-20" },
      { id: "u5", name: "João Mbemba", email: "joao@platinalose.ao", role: "Colaborador", cardId: "c6", isActive: true, joinedAt: "2024-05-10" },
      { id: "u6", name: "Carla Domingos", email: "carla@platinalose.ao", role: "Colaborador", cardId: "c7", isActive: true, joinedAt: "2024-07-22" },
      { id: "u7", name: "Tomás Ferreira", email: "tomas@platinalose.ao", role: "Colaborador", cardId: null, isActive: false, joinedAt: "2025-02-01" },
    ],
    cards: [
      { id: "c5", uid: "FROTA00007890", masked: "**** **** **** 7890", assignedTo: "Maria Silva", assignedRole: "Gestor", balanceKz: 310000, limitKz: 400000, status: "ACTIVE", validThru: "11/27", lastUsed: "2026-02-02" },
      { id: "c6", uid: "FROTA00002345", masked: "**** **** **** 2345", assignedTo: "João Mbemba", assignedRole: "Colaborador", balanceKz: 72000, limitKz: 100000, status: "ACTIVE", validThru: "08/27", lastUsed: "2026-01-30" },
      { id: "c7", uid: "FROTA00006789", masked: "**** **** **** 6789", assignedTo: "Carla Domingos", assignedRole: "Colaborador", balanceKz: 58000, limitKz: 80000, status: "ACTIVE", validThru: "05/27", lastUsed: "2026-01-25" },
      { id: "c8", uid: "FROTA00000123", masked: "**** **** **** 0123", assignedTo: null, assignedRole: null, balanceKz: 0, limitKz: 60000, status: "SUSPENDED", validThru: "01/26", lastUsed: null },
      { id: "c9", uid: "FROTA00004567", masked: "**** **** **** 4567", assignedTo: null, assignedRole: null, balanceKz: 120000, limitKz: 200000, status: "ACTIVE", validThru: "10/28", lastUsed: "2025-12-18" },
      { id: "c10", uid: "FROTA00008901", masked: "**** **** **** 8901", assignedTo: null, assignedRole: null, balanceKz: 95000, limitKz: 150000, status: "ACTIVE", validThru: "04/28", lastUsed: "2026-01-05" },
    ],
  },
];
