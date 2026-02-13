export type StationStatus = "ATIVO" | "INDISPONIVEL";

export type PartnerStation = {
  id: string;
  name: string;
  location: string;
  status: StationStatus;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
