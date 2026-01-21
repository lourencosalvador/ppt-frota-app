export type ManualFuelStatus = "ABERTO" | "APROVADO" | "EM REGULARIZAÇÃO";

export type ManualFuelRecord = {
  id: string;
  date: string; // 5/21/2024
  time: string; // 09:15 AM
  requester: string;
  vehicle: string;
  amountKz: number;
  liters: number;
  status: ManualFuelStatus;
};

export const historyByStationId: Record<string, ManualFuelRecord[]> = {
  s1: [
    {
      id: "r1",
      date: "5/21/2024",
      time: "09:15 AM",
      requester: "Lorrys Cliente",
      vehicle: "XX-99-YY",
      amountKz: 85.5,
      liters: 50,
      status: "ABERTO",
    },
    {
      id: "r2",
      date: "5/15/2024",
      time: "11:00 AM",
      requester: "Lorrys Cliente",
      vehicle: "AA-00-BB",
      amountKz: 205.5,
      liters: 70,
      status: "APROVADO",
    },
  ],
  s2: [
    {
      id: "r1",
      date: "5/20/2024",
      time: "03:40 PM",
      requester: "Lorrys Cliente",
      vehicle: "LD-22-33-AA",
      amountKz: 120.0,
      liters: 60,
      status: "EM REGULARIZAÇÃO",
    },
  ],
  s3: [],
};

