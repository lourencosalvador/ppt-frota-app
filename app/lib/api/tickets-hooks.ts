"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiTicket, ListTicketsParams, UpdateTicketBody } from "@/app/lib/api/tickets";
import { createTicket, deleteTicket, getTicket, listTickets, updateTicketPatch, updateTicketPut } from "@/app/lib/api/tickets";

export const ticketsQueryKey = (params?: ListTicketsParams) =>
  [
    "tickets",
    params?.status ?? "",
    params?.ticket_type ?? "",
    params?.priority ?? "",
    params?.search ?? "",
    params?.page ?? 1,
    params?.page_size ?? 50,
  ] as const;

export function useTickets(params?: ListTicketsParams) {
  return useQuery({
    queryKey: ticketsQueryKey(params),
    queryFn: () => listTickets(params),
    staleTime: 15_000,
  });
}

export const ticketQueryKey = (ticketId: string) => ["ticket", ticketId] as const;

export function useTicket(ticketId: string | null) {
  return useQuery({
    queryKey: ticketId ? ticketQueryKey(ticketId) : ["ticket", "none"],
    queryFn: () => getTicket(ticketId as string),
    enabled: Boolean(ticketId),
    staleTime: 30_000,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => createTicket(form),
    onSuccess: (created) => {
      // Patch any cached lists (prepend) and invalidate for full server truth
      const queries = qc.getQueriesData<ApiTicket[]>({ queryKey: ["tickets"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        qc.setQueryData<ApiTicket[]>(key, [created, ...data]);
      }
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => deleteTicket(ticketId),
    onSuccess: (_void, ticketId) => {
      const queries = qc.getQueriesData<ApiTicket[]>({ queryKey: ["tickets"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        qc.setQueryData<ApiTicket[]>(key, data.filter((t) => t.id !== ticketId));
      }
      qc.removeQueries({ queryKey: ticketQueryKey(ticketId) });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { ticketId: string; body: UpdateTicketBody; method?: "PUT" | "PATCH" }) => {
      const m = args.method ?? "PATCH";
      return m === "PUT"
        ? updateTicketPut(args.ticketId, args.body)
        : updateTicketPatch(args.ticketId, args.body);
    },
    onSuccess: (updated) => {
      qc.setQueryData(ticketQueryKey(updated.id), updated);
      const queries = qc.getQueriesData<ApiTicket[]>({ queryKey: ["tickets"] });
      for (const [key, data] of queries) {
        if (!data) continue;
        qc.setQueryData<ApiTicket[]>(
          key,
          data.map((t) => (t.id === updated.id ? updated : t)),
        );
      }
    },
  });
}

