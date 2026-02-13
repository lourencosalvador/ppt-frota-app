export type FrotaCard = {
  id: string;
  last4: string;
  owner: string;
  balanceKz: number;
  blocked?: boolean;
  validThru: string; // MM/YY
  dailyLimitKz: number;
  monthlyLimitKz: number;
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
