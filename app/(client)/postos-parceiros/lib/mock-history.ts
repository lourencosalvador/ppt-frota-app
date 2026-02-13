export type ManualFuelStatus = "ABERTO" | "APROVADO" | "EM REGULARIZAÇÃO";

export type ManualFuelRecord = {
  id: string;
  date: string;
  time: string;
  requester: string;
  vehicle: string;
  amountKz: number;
  liters: number;
  status: ManualFuelStatus;
};
