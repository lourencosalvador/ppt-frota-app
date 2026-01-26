"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

function formatMatricula(raw: string) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const parts = cleaned.match(/.{1,2}/g) ?? [];
  return parts.join("-");
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

function nextTicketCode(existing: Ticket[]) {
  const nums = existing
    .map((t) => t.code.match(/TKT-(\d{4})-(\d+)/))
    .map((m) => (m ? Number(m[2]) : 0))
    .filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const year = new Date().getFullYear();
  return `TKT-${year}-${String(next).padStart(3, "0")}`;
}

const ticketSchema = z.object({
  requestType: z.enum(["PEDIDO_CARTAO", "ABASTECIMENTO_MANUAL", "SUPORTE", "CARREGAMENTO", "OUTRO"]),
  subject: z.string().trim().min(1, "O Assunto é obrigatório."),
  priority: z.enum(["Urgente", "Alta", "Normal", "Baixa"]),
  matricula: z.string(),
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (ticket: Ticket) => void;
  requesterName: string;
  requesterRole: string;
  existingTickets: Ticket[];
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileIsImage, setFileIsImage] = useState(false);

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
      matricula: "",
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
      matricula: "",
      description: "",
    });
    setFileName(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setFileIsImage(false);
  }

  async function submit(values: TicketFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await sleep(1800);

    const status: TicketStatus = values.requestType === "PEDIDO_CARTAO" ? "EM ANALISE" : "ABERTO";
    const code = nextTicketCode(existingTickets);

    const matriculaValue = (values.matricula ?? "").trim();
    const fullSubject = matriculaValue
      ? `${values.subject.trim()} (${matriculaValue.toUpperCase()})`
      : values.subject.trim();

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
      code,
      subject: fullSubject,
      type: toTicketType(values.requestType),
      requester: requesterName,
      requesterRole,
      priority: values.priority as TicketPriority,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
      description: values.description.trim(),
      matricula: matriculaValue ? matriculaValue.toUpperCase() : undefined,
      attachmentName: fileName ?? undefined,
      requestTypeLabel,
    };

    onCreate(newTicket);
    toast.success("Ticket criado com sucesso.");

    setIsSubmitting(false);
    onOpenChange(false);
    reset();
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Label>Matricula (Op)</Label>
              <Controller
                control={control}
                name="matricula"
                render={({ field }) => (
              <Input
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatMatricula(e.target.value))}
                placeholder="AA-00-BB"
                className="h-12 rounded-xl bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-400 focus-visible:ring-white/10"
                inputMode="text"
                  />
                )}
              />
            </div>
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

