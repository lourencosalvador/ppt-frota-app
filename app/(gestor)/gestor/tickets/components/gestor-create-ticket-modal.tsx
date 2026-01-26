"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Ticket, TicketPriority, TicketStatus, TicketType } from "@/app/(client)/meus-pedidos/lib/mock-tickets";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  subject: z.string().trim().min(1, "O Assunto é obrigatório."),
  type: z.enum(["PEDIDO CARTAO", "ABASTECIMENTO MANUAL", "SUPORTE", "CARREGAMENTO", "OUTRO"]),
  requester: z.string().trim().min(1, "O Solicitante é obrigatório."),
  requesterRole: z.string().trim().min(1, "A Função é obrigatória."),
  priority: z.enum(["Urgente", "Alta", "Normal", "Baixa"]),
  description: z.string().trim().min(1, "A Descrição é obrigatória."),
});

type Values = z.infer<typeof schema>;

function nextCode(existing: Ticket[]) {
  const nums = existing
    .map((t) => t.code.match(/TKT-(\d{4})-(\d+)/))
    .map((m) => (m ? Number(m[2]) : 0))
    .filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const year = new Date().getFullYear();
  return `TKT-${year}-${String(next).padStart(3, "0")}`;
}

export default function GestorCreateTicketModal({
  open,
  onOpenChange,
  existingTickets,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingTickets: Ticket[];
  onCreate: (t: Ticket) => void;
}) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      subject: "",
      type: "PEDIDO CARTAO",
      requester: "",
      requesterRole: "Cliente",
      priority: "Normal",
      description: "",
    },
  });

  async function submit(values: Values) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await new Promise<void>((r) => setTimeout(r, 450));

    const ticket: Ticket = {
      id: crypto.randomUUID(),
      code: nextCode(existingTickets),
      subject: values.subject.trim(),
      type: values.type as TicketType,
      requester: values.requester.trim(),
      requesterRole: values.requesterRole.trim(),
      priority: values.priority as TicketPriority,
      status: "EM ANALISE" as TicketStatus,
      createdAt: new Date().toISOString().slice(0, 10),
      description: values.description.trim(),
      requestTypeLabel: values.type === "PEDIDO CARTAO" ? "Pedido de Cartão Frota+" : undefined,
    };

    onCreate(ticket);
    toast.success("Ticket criado.");
    setIsSubmitting(false);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
        if (v) setTimeout(() => firstInputRef.current?.focus(), 50);
      }}
    >
      <DialogContent className="max-w-[720px] overflow-hidden p-0">
        <div className="border-b border-zinc-100 py-5 pl-6 pr-16">
          <DialogHeader className="border-0 px-0 py-0">
            <DialogTitle className="text-2xl font-extrabold">Novo Ticket</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label>Assunto</Label>
              <Input
                {...register("subject")}
                ref={(el) => {
                  register("subject").ref(el);
                  firstInputRef.current = el;
                }}
                placeholder="Ex: Solicitação de novo cartão"
                className={[
                  "h-12 rounded-xl border-zinc-200 bg-white text-sm font-semibold",
                  errors.subject ? "border-red-300 focus-visible:ring-red-500/15" : "",
                ].join(" ")}
              />
              {errors.subject?.message ? (
                <div className="text-xs font-semibold text-red-600">{errors.subject.message}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEDIDO CARTAO">PEDIDO CARTAO</SelectItem>
                      <SelectItem value="ABASTECIMENTO MANUAL">ABASTECIMENTO MANUAL</SelectItem>
                      <SelectItem value="CARREGAMENTO">CARREGAMENTO CONTA</SelectItem>
                      <SelectItem value="SUPORTE">SUPORTE</SelectItem>
                      <SelectItem value="OUTRO">OUTRO</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Solicitante</Label>
              <Input
                {...register("requester")}
                placeholder="Ex: Lorrys Cliente"
                className={[
                  "h-12 rounded-xl border-zinc-200 bg-white text-sm font-semibold",
                  errors.requester ? "border-red-300 focus-visible:ring-red-500/15" : "",
                ].join(" ")}
              />
              {errors.requester?.message ? (
                <div className="text-xs font-semibold text-red-600">{errors.requester.message}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Input
                {...register("requesterRole")}
                placeholder="Cliente"
                className={[
                  "h-12 rounded-xl border-zinc-200 bg-white text-sm font-semibold",
                  errors.requesterRole ? "border-red-300 focus-visible:ring-red-500/15" : "",
                ].join(" ")}
              />
              {errors.requesterRole?.message ? (
                <div className="text-xs font-semibold text-red-600">{errors.requesterRole.message}</div>
              ) : null}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                {...register("description")}
                placeholder="Descreva o pedido..."
                className={[
                  "min-h-[120px] rounded-xl border-zinc-200 bg-white text-sm font-semibold",
                  errors.description ? "border-red-300 focus-visible:ring-red-500/15" : "",
                ].join(" ")}
              />
              {errors.description?.message ? (
                <div className="text-xs font-semibold text-red-600">{errors.description.message}</div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="mt-6 border-0 px-0 py-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "A criar..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

