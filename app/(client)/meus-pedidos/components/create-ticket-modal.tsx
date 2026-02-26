"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@/app/lib/api/api-client";
import { useCreateTicket } from "@/app/lib/api/tickets-hooks";
import { apiTicketToUi } from "@/app/(client)/meus-pedidos/lib/ticket-api-mapper";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/app/(client)/meus-pedidos/lib/mock-tickets";
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

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function toTicketType(v: string): TicketType {
  switch (v) {
    case "PEDIDO_CARTAO":
      return "PEDIDO CARTAO";
    case "ABASTECIMENTO_MANUAL":
      return "ABASTECIMENTO MANUAL";
    case "SUPORTE":
      return "SUPORTE";
    case "CARREGAMENTO":
      return "CARREGAMENTO";
    default:
      return "OUTRO";
  }
}

function requestTypeToApi(v: TicketFormValues["requestType"]) {
  switch (v) {
    case "PEDIDO_CARTAO":
      return "card_request";
    case "ABASTECIMENTO_MANUAL":
      return "manual_refuel";
    case "CARREGAMENTO":
      return "account_topup";
    case "SUPORTE":
      return "support";
    default:
      return "other";
  }
}

function priorityToApi(v: TicketFormValues["priority"]) {
  switch (v) {
    case "Urgente":
      return "urgent";
    case "Alta":
      return "high";
    case "Baixa":
      return "low";
    default:
      return "normal";
  }
}

const ticketSchema = z.object({
  requestType: z.enum(["PEDIDO_CARTAO", "ABASTECIMENTO_MANUAL", "SUPORTE", "CARREGAMENTO", "OUTRO"]),
  subject: z.string().trim().min(1, "O Assunto é obrigatório."),
  priority: z.enum(["Urgente", "Alta", "Normal", "Baixa"]),
  description: z.string().trim().min(1, "A Descrição Detalhada é obrigatória."),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function CreateTicketModal({
  open,
  onOpenChange,
  onCreate,
  requesterName,
  requesterRole,
  existingTickets,
  mode = "local",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (ticket: Ticket) => void;
  requesterName: string;
  requesterRole: string;
  existingTickets?: Ticket[];
  mode?: "local" | "api";
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileIsImage, setFileIsImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const createTicket = useCreateTicket();

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    mode: "onChange",
    defaultValues: {
      requestType: "PEDIDO_CARTAO",
      subject: "",
      priority: "Normal",
      description: "",
    },
  });

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  function reset() {
    resetForm({
      requestType: "PEDIDO_CARTAO",
      subject: "",
      priority: "Normal",
      description: "",
    });
    setFileName(null);
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setFileIsImage(false);
  }

  async function submit(values: TicketFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (mode === "api") {
        const form = new FormData();
        form.set("ticket_type", requestTypeToApi(values.requestType));
        form.set("subject", values.subject.trim());
        form.set("priority", priorityToApi(values.priority));
        if (values.description?.trim()) form.set("description", values.description.trim());
        if (file) form.set("attachment", file);

        const created = await createTicket.mutateAsync(form);
        const uiTicket = apiTicketToUi(created, requesterRole);
        onCreate?.(uiTicket);
        toast.success("Ticket criado com sucesso.");
        onOpenChange(false);
        reset();
        setIsSubmitting(false);
        return;
      }

      // fallback local (demo)
      await sleep(900);
      const status: TicketStatus = values.requestType === "PEDIDO_CARTAO" ? "EM ANALISE" : "ABERTO";
      const fullSubject = values.subject.trim();
      const requestTypeLabel =
        values.requestType === "PEDIDO_CARTAO"
          ? "Pedido de Cartão Frota+"
          : values.requestType === "ABASTECIMENTO_MANUAL"
            ? "Abastecimento Manual"
            : values.requestType === "SUPORTE"
              ? "Suporte"
              : values.requestType === "CARREGAMENTO"
                ? "Carregamento"
                : "Outro";

      const newTicket: Ticket = {
        id: crypto.randomUUID(),
        code: `TKT-${new Date().getFullYear()}-${String((existingTickets?.length ?? 0) + 1).padStart(3, "0")}`,
        subject: fullSubject,
        type: toTicketType(values.requestType),
        requester: requesterName,
        requesterRole,
        priority: values.priority as TicketPriority,
        status,
        createdAt: new Date().toISOString().slice(0, 10),
        description: values.description.trim(),
        attachmentName: fileName ?? undefined,
        requestTypeLabel,
      };

      onCreate?.(newTicket);
      toast.success("Ticket criado com sucesso.");
      onOpenChange(false);
      reset();
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(e.message);
      } else {
        toast.error("Falha ao criar ticket.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Ticket / Solicitação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label>Tipo de Solicitação</Label>
            <Controller
              control={control}
              name="requestType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-12 rounded-xl bg-zinc-800 text-white border-zinc-700 focus:ring-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEDIDO_CARTAO">Pedido de Cartão Frota+</SelectItem>
                <SelectItem value="ABASTECIMENTO_MANUAL">Abastecimento Manual</SelectItem>
                <SelectItem value="SUPORTE">Suporte</SelectItem>
                <SelectItem value="CARREGAMENTO">Carregamento</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Assunto</Label>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
            <Input
                  {...field}
                  placeholder="Ex: Novo cartão para cliente X"
                  className={[
                    "h-12 rounded-xl bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-400 focus-visible:ring-white/10",
                    errors.subject ? "border-red-500/60 focus-visible:ring-red-500/20" : "",
                  ].join(" ")}
                />
              )}
            />
            {errors.subject?.message ? (
              <div className="text-xs font-semibold text-red-500">{errors.subject.message}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-800 text-white border-zinc-700 focus:ring-white/10">
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
            <Label>Anexar Documento / Foto</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center"
            >
              <div className="flex w-full flex-col items-center">
                {fileIsImage && filePreviewUrl ? (
                  <Image
                    src={filePreviewUrl}
                    alt="Pré-visualização"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-semibold text-zinc-700">
                Clique para carregar foto ou PDF
              </div>
              <div className="mt-1 text-xs font-medium text-zinc-400">
                A nossa IA irá analisar o documento automaticamente.
              </div>
              {fileName ? (
                <div className="mt-3 text-xs font-semibold text-zinc-600">
                  {fileName}
                </div>
              ) : null}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file ? file.name : null);
                setFile(file ?? null);

                if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                if (!file) {
                  setFilePreviewUrl(null);
                  setFileIsImage(false);
                  return;
                }

                const isImage = file.type.startsWith("image/");
                setFileIsImage(isImage);
                setFilePreviewUrl(isImage ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição Detalhada</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
            <Textarea
                  {...field}
              placeholder="Descreva a necessidade..."
                  className={[
                    "min-h-[140px] rounded-xl bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-400 focus-visible:ring-white/10",
                    errors.description ? "border-red-500/60 focus-visible:ring-red-500/20" : "",
                  ].join(" ")}
                />
              )}
            />
            {errors.description?.message ? (
              <div className="text-xs font-semibold text-red-500">{errors.description.message}</div>
            ) : null}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 w-[48%] rounded-xl"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            onClick={handleSubmit(submit)}
            className="h-12 w-[48%] rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A criar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Criar Ticket
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

