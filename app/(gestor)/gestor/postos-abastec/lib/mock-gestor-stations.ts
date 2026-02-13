import type { FuelAvailability, FuelType } from "@/app/(client)/postos-parceiros/lib/mock-stations";
import type { ManualFuelRecord } from "@/app/(client)/postos-parceiros/lib/mock-history";

export type GestorStation = {
  id: string;
  name: string;
  city: string;
  status: "DISPONIVEL" | "INDISPONIVEL";
  updatedLabel: string;
  fuels: FuelAvailability[];
  auditHistory: ManualFuelRecord[];
};

export type FuelFilter = "TODOS" | FuelType;
