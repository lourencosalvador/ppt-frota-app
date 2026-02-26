"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const MOCK_AGENTS = [
  { id: "agent-1", name: "Ana Suporte" },
  { id: "agent-2", name: "Carlos Técnico" },
  { id: "agent-3", name: "Maria Operadora" },
];

const schema = z.object({
  requestType: z.enum([
    "PEDIDO_CARTAO",
    "ABASTECIMENTO_MANUAL",
    "SUPORTE",
    "CARREGAMENTO",
    "OUTRO",
  ]),
  subject: z.string().trim().min(1, "O Assunto é obrigatório."),
  priority: z.enum(["Urgente", "Alta", "Normal", "Baixa"]),
  impact: z.enum(["Alto", "Médio", "Baixo"]),
  assignedTo: z.string().optional(),
  description: z.string().trim().min(1, "A Descrição é obrigatória."),
});

type FormValues = z.infer<typeof schema>;

export default function SupportCreateTicketModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      requestType: "SUPORTE",
      subject: "",
      priority: "Normal",
      impact: "Médio",
      assignedTo: "",
      description: "",
    },
  });

  function reset() {
    resetForm({
      requestType: "SUPORTE",
      subject: "",
      priority: "Normal",
      impact: "Médio",
      assignedTo: "",
      description: "",
    });
  }

  async function submit(values: FormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await new Promise<void>((r) => setTimeout(r, 800));
      const assignee = MOCK_AGENTS.find((a) => a.id === values.assignedTo);
      toast.success(
        `Ticket criado${assignee ? ` e atribuído a ${assignee.name}` : ""}.`,
      );
      onOpenChange(false);
      reset();
    } catch {
      toast.error("Falha ao criar ticket.");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label>Tipo de Solicitação</Label>
            <Controller
              control={control}
              name="requestType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 rounded-xl">
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
                  placeholder="Ex: Falha no abastecimento do cartão 1234"
                  className={[
                    "h-12 rounded-xl",
                    errors.subject ? "border-red-500/60 focus-visible:ring-red-500/20" : "",
                  ].join(" ")}
                />
              )}
            />
            {errors.subject?.message ? (
              <div className="text-xs font-semibold text-red-500">{errors.subject.message}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label>Impacto</Label>
              <Controller
                control={control}
                name="impact"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Controller
              control={control}
              name="assignedTo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Selecionar responsável..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não atribuir agora</SelectItem>
                    {MOCK_AGENTS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Descreva o problema ou necessidade..."
                  className={[
                    "min-h-[120px] rounded-xl",
                    errors.description ? "border-red-500/60 focus-visible:ring-red-500/20" : "",
                  ].join(" ")}
                />
              )}
            />
            {errors.description?.message ? (
              <div className="text-xs font-semibold text-red-500">
                {errors.description.message}
              </div>
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
