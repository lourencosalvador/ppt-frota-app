import type { FuelAvailability, FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";

export type GestorStation = {
  id: string;
  name: string;
  city: string;
  status: "DISPONIVEL" | "INDISPONIVEL";
  updatedLabel: string; // "Agora mesmo"
  fuels: FuelAvailability[];
  auditHistory: ManualFuelRecord[];
};

export type FuelFilter = "TODOS" | FuelType;

export const gestorStationsMock: GestorStation[] = [
  {
    id: "gs1",
    name: "Posto Central - Av. Liberdade",
    city: "Huíla",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "LIMITADO" },
    ],
    auditHistory: [
      {
        id: "g1",
        date: "21/05/2024",
        time: "09:15",
        requester: "João Motorista",
        vehicle: "XX-99-YY",
        amountKz: 85.5,
        liters: 50,
        status: "ABERTO",
      },
      {
        id: "g2",
        date: "15/05/2024",
        time: "11:00",
        requester: "João Motorista",
        vehicle: "AA-00-BB",
        amountKz: 120,
        liters: 70,
        status: "APROVADO",
      },
    ],
  },
  {
    id: "gs2",
    name: "Posto Norte - Zona Industrial",
    city: "Luanda",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "INDISPONIVEL" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
    auditHistory: [
      {
        id: "g3",
        date: "14/01/2026",
        time: "10:20",
        requester: "Carlos Gestor",
        vehicle: "LA-091-A-89",
        amountKz: 25000,
        liters: 15.9,
        status: "EM REGULARIZAÇÃO",
      },
    ],
  },
  {
    id: "gs3",
    name: "Posto Sul - A2",
    city: "Benguela",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "LIMITADO" },
      { fuel: "AdBlue", status: "INDISPONIVEL" },
    ],
    auditHistory: [],
  },
];

