import type { FuelAvailability } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";

export type SupportStation = {
  id: string;
  name: string;
  city: string;
  status: "DISPONIVEL" | "INDISPONIVEL";
  updatedLabel: string;
  fuels: FuelAvailability[];
  auditHistory: ManualFuelRecord[];
};

export const supportStationsMock: SupportStation[] = [
  {
    id: "ss1",
    name: "Posto Central - Av. Liberdade",
    city: "Huila",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
    auditHistory: [
      {
        id: "a-1",
        date: "1/14/2026",
        time: "10:22",
        requester: "Ana Suporte",
        vehicle: "LA-757-01",
        amountKz: 23000,
        liters: 10,
        status: "ABERTO",
      },
      {
        id: "a-2",
        date: "1/14/2026",
        time: "11:05",
        requester: "Ana Suporte",
        vehicle: "LA-9101-KA",
        amountKz: 25000,
        liters: 10,
        status: "ABERTO",
      },
      {
        id: "a-3",
        date: "1/14/2026",
        time: "11:40",
        requester: "Carlos Gestor",
        vehicle: "LA-891-A-89",
        amountKz: 25000,
        liters: 15.9,
        status: "EM REGULARIZAÇÃO",
      },
      {
        id: "a-4",
        date: "5/21/2024",
        time: "09:10",
        requester: "João Motorista",
        vehicle: "XX-99-YY",
        amountKz: 85.5,
        liters: 50,
        status: "ABERTO",
      },
      {
        id: "a-5",
        date: "5/15/2024",
        time: "16:20",
        requester: "João Motorista",
        vehicle: "AA-00-BB",
        amountKz: 120,
        liters: 70,
        status: "APROVADO",
      },
    ],
  },
  {
    id: "ss2",
    name: "Posto Norte - Zona Industrial",
    city: "Luanda",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
    auditHistory: [],
  },
  {
    id: "ss3",
    name: "Posto Sul - A2",
    city: "Benguela",
    status: "DISPONIVEL",
    updatedLabel: "Agora mesmo",
    fuels: [
      { fuel: "Diesel", status: "OK" },
      { fuel: "Gasolina 95", status: "OK" },
      { fuel: "AdBlue", status: "OK" },
    ],
    auditHistory: [],
  },
];

