import { apiFetch } from "@/app/lib/api/api-client";

export type CardStatus = "active" | "inactive" | "blocked" | "expired";

export type ApiCard = {
  id: string;
  uid: string;
  company: string;
  company_name: string;
  amount: string;
  current_balance: string;
  status: CardStatus;
  daily_limit: string;
  monthly_limit: string;
  issued_at: string;
  expires_at: string;
};

export type UpdateCardLimitBody = {
  daily_limit?: string;
  monthly_limit?: string;
};

export async function listCards(params?: { status?: CardStatus }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ApiCard[]>(`/cards/${suffix}`);
}

export async function updateCardLimits(cardId: string, body: UpdateCardLimitBody) {
  return apiFetch<ApiCard>(`/cards/${encodeURIComponent(cardId)}/limit/`, {
    method: "PATCH",
    body,
  });
}

