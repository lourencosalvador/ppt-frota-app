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

export const mockPartnerStations: PartnerStation[] = [
  { id: "ps1", name: "Posto Central - Av. Liberdade", location: "Lisboa", status: "ATIVO" },
  { id: "ps2", name: "Posto Norte - Zona Industrial", location: "Porto", status: "INDISPONIVEL" },
  { id: "ps3", name: "Posto Sul - A2", location: "Algarve", status: "INDISPONIVEL" },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    name: "Referência Multibanco",
    description: "Pagamento via entidade e referência.",
    active: true,
  },
  {
    id: "pm2",
    name: "Transferência Bancária (IBAN)",
    description: "Validação manual mediante comprovativo.",
    active: true,
  },
  {
    id: "pm3",
    name: "Débito Direto (SEPA)",
    description: "Cobrança automática mensal.",
    active: false,
  },
  {
    id: "pm4",
    name: "Cheque Bancário",
    description: "Apenas presencial na sede.",
    active: false,
  },
];

