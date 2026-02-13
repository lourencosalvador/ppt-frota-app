export type AccountStatus = "ACTIVE" | "INACTIVE";

export type Account = {
  id: string;
  name: string;
  accountNumber: string;
  activeCards: number;
  status: AccountStatus;
  balanceKz: number;
};

export type TxType = "ABASTECIMENTO" | "RECARGA" | "AJUSTE";

export type Transaction = {
  id: string;
  dateISO: string;
  type: TxType;
  title: string;
  refId: string;
  location: string;
  plate?: string;
  driver?: string;
  amountKz: number;
};
