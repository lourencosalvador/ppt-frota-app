"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/app/lib/api/api-client";
import { listCards, updateCardLimits, type ApiCard, type CardStatus, type UpdateCardLimitBody } from "@/app/lib/api/cards";

export const cardsQueryKey = (params?: { status?: CardStatus }) =>
  ["cards", params?.status ?? "all"] as const;

export function useCards(params?: { status?: CardStatus }) {
  return useQuery({
    queryKey: cardsQueryKey(params),
    queryFn: () => listCards(params),
  });
}

export function useUpdateCardLimits() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { cardId: string; body: UpdateCardLimitBody }) => {
      return updateCardLimits(args.cardId, args.body);
    },
    onSuccess: (updated) => {
      const queries = qc.getQueriesData<ApiCard[]>({ queryKey: ["cards"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        qc.setQueryData<ApiCard[]>(
          key,
          data.map((c) => (c.id === updated.id ? updated : c)),
        );
      }
    },
    onError: (err) => {
      // keep as-is; UI decides how to surface ApiError details
      if (err instanceof ApiError) return;
    },
  });
}

