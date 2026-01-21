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
  updatedLabel: string; // "Agora mesmo"
  fuels: FuelAvailability[];
};

export const mockStations: PartnerStation[] = [
  {
    id: "s1",
    name: "Posto Central - Av. Liberdade",
    city: "Lisboa",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
  },
  {
    id: "s2",
    name: "Posto Norte - Zona Industrial",
    city: "Porto",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
  },
  {
    id: "s3",
    name: "Posto Sul - A2",
    city: "Algarve",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
  },
];

