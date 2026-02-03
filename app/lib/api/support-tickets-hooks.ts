"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/app/lib/api/api-client";
import type { StationAuditResponse } from "@/app/lib/api/stations";
import { justifySupportTicket } from "@/app/lib/api/support-tickets";

export function useJustifySupportTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { stationId: string; ticketId: string; justification: string }) => {
      return justifySupportTicket(args.ticketId, { justification: args.justification });
    },
    onSuccess: (updated, variables) => {
      // Patch any cached station-audit payloads containing this ticket.
      const queries = qc.getQueriesData<StationAuditResponse>({ queryKey: ["station-audit"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        const has = data.tickets?.some((t) => t.id === updated.id);
        if (!has) continue;
        qc.setQueryData<StationAuditResponse>(key, {
          ...data,
          tickets: data.tickets.map((t) => (t.id === updated.id ? updated : t)),
        });
      }

      // Invalidate station audit for accurate counters per status.
      qc.invalidateQueries({ queryKey: ["station-audit", variables.stationId] });
    },
    onError: (err) => {
      if (err instanceof ApiError) return;
    },
  });
}

