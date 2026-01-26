export type AccountStatus = "ACTIVE" | "INACTIVE";

export type Account = {
  id: string;
  name: string;
  accountNumber: string; // "PT50 0000 0000 0000 1234 5"
  activeCards: number;
  status: AccountStatus;
  balanceKz: number;
};

export type TxType = "ABASTECIMENTO" | "RECARGA" | "AJUSTE";

export type Transaction = {
  id: string;
  dateISO: string; // YYYY-MM-DD
  type: TxType;
  title: string;
  refId: string; // "ID: t1"
  location: string; // "Lisboa" / "Online / Sede"
  plate?: string; // "AA-00-BB"
  driver?: string; // "João M."
  amountKz: number; // negativo = débito
};

export const mockAccounts: Account[] = [
  {
    id: "a1",
    name: "Frota Norte Distribuição Lda",
    accountNumber: "PT50 0000 0000 0000 1234 5",
    activeCards: 45,
    status: "ACTIVE",
    balanceKz: 15420,
  },
  {
    id: "a2",
    name: "Frota Sul Logística",
    accountNumber: "PT50 0000 0000 0000 9876 5",
    activeCards: 12,
    status: "ACTIVE",
    balanceKz: 2100.5,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    dateISO: "2024-05-20",
    type: "ABASTECIMENTO",
    title: "Abastecimento Posto Central",
    refId: "ID: t1",
    location: "Lisboa",
    plate: "AA-00-BB",
    driver: "João M.",
    amountKz: -85,
  },
  {
    id: "t2",
    dateISO: "2024-05-18",
    type: "RECARGA",
    title: "Recarga Mensal",
    refId: "ID: t2",
    location: "Online / Sede",
    amountKz: 500,
  },
  {
    id: "t3",
    dateISO: "2024-05-15",
    type: "ABASTECIMENTO",
    title: "Abastecimento Posto Sul",
    refId: "ID: t3",
    location: "Algarve",
    plate: "AA-00-BB",
    driver: "João M.",
    amountKz: -60,
  },
];

