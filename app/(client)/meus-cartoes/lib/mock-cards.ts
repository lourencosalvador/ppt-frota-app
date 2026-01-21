export type FrotaCard = {
  id: string;
  last4: string;
  owner: string;
  balanceKz: number;
  blocked?: boolean;
  validThru: string; // MM/YY
  limitKz: number;
  minLimitKz: number;
  usagePercent: number; // 0..100
  transactions: {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    location?: string;
    amountKz: number; // positive for credit, negative for debit
  }[];
};

export const mockCards: FrotaCard[] = [
  {
    id: "c1",
    last4: "4829",
    owner: "Lorrys Cliente",
    balanceKz: 120_500,
    validThru: "12/26",
    limitKz: 500_000,
    minLimitKz: 20_000,
    usagePercent: 24,
    transactions: [
      {
        id: "t1",
        title: "Abastecimento Pumangol Luanda",
        date: "2024-05-20",
        location: "LUANDA",
        amountKz: -13_500,
      },
      {
        id: "t2",
        title: "Recarga Mensal",
        date: "2024-05-18",
        amountKz: 500_000,
      },
      {
        id: "t3",
        title: "Abastecimento Pumangol Benguela",
        date: "2024-05-10",
        location: "BENGUELA",
        amountKz: -22_000,
      },
    ],
  },
  {
    id: "c2",
    last4: "9921",
    owner: "Maria Santos",
    balanceKz: 45_000,
    validThru: "08/27",
    limitKz: 200_000,
    minLimitKz: 15_000,
    usagePercent: 40,
    transactions: [
      { id: "t1", title: "Abastecimento Pumangol Talatona", date: "2024-05-21", location: "LUANDA", amountKz: -9_800 },
      { id: "t2", title: "Recarga", date: "2024-05-18", amountKz: 50_000 },
      { id: "t3", title: "Abastecimento Pumangol Cacuaco", date: "2024-05-14", location: "LUANDA", amountKz: -12_400 },
    ],
  },
  {
    id: "c3",
    last4: "1122",
    owner: "Pedro Costa",
    balanceKz: 0,
    blocked: true,
    validThru: "01/26",
    limitKz: 150_000,
    minLimitKz: 10_000,
    usagePercent: 0,
    transactions: [],
  },
  {
    id: "c4",
    last4: "7741",
    owner: "Frota Geral #1",
    balanceKz: 210_000,
    validThru: "11/28",
    limitKz: 800_000,
    minLimitKz: 30_000,
    usagePercent: 18,
    transactions: [
      { id: "t1", title: "Recarga", date: "2024-05-18", amountKz: 200_000 },
      { id: "t2", title: "Abastecimento Pumangol Luanda", date: "2024-05-20", location: "LUANDA", amountKz: -18_700 },
      { id: "t3", title: "Abastecimento Pumangol Viana", date: "2024-05-19", location: "LUANDA", amountKz: -9_300 },
    ],
  },
  {
    id: "c5",
    last4: "8852",
    owner: "Frota Geral #2",
    balanceKz: 15_000,
    validThru: "03/27",
    limitKz: 120_000,
    minLimitKz: 10_000,
    usagePercent: 75,
    transactions: [
      { id: "t1", title: "Abastecimento Pumangol Benguela", date: "2024-05-10", location: "BENGUELA", amountKz: -22_000 },
      { id: "t2", title: "Recarga", date: "2024-05-09", amountKz: 30_000 },
      { id: "t3", title: "Abastecimento Pumangol Benguela", date: "2024-05-08", location: "BENGUELA", amountKz: -7_500 },
    ],
  },
];

