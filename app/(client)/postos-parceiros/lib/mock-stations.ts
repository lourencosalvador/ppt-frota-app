export type FuelType = "Diesel" | "Gasolina 95" | "AdBlue";

export type FuelAvailability = {
  fuel: FuelType;
  status: "OK" | "LIMITADO" | "INDISPONIVEL";
};

export type PartnerStation = {
  id: string;
  name: string;
  city: string;
  status: "DISPONIVEL" | "INDISPONIVEL";
  updatedLabel: string;
  fuels: FuelAvailability[];
};
