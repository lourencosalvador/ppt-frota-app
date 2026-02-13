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
