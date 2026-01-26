"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import type { PartnerStation, StationStatus } from "@/app/(gestor)/gestor/configuracoes/lib/mock-config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StationModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PartnerStation | null;
  onSave: (station: PartnerStation) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<StationStatus>("ATIVO");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const canSave = useMemo(() => name.trim().length > 3 && location.trim().length > 1 && !isSaving, [name, location, isSaving]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setLocation(initial?.location ?? "");
    setStatus(initial?.status ?? "ATIVO");
    setIsSaving(false);
  }, [open, initial]);

  async function submit() {
    if (!canSave) return;
    setIsSaving(true);
    await new Promise<void>((r) => setTimeout(r, 800));

    const station: PartnerStation = {
      id: initial?.id ?? (crypto?.randomUUID?.() ?? `${Date.now()}`),
      name: name.trim(),
      location: location.trim(),
      status,
    };
    onSave(station);
    toast.success(isEdit ? "Posto atualizado." : "Posto criado.");
    setIsSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Posto" : "Novo Posto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label>Nome do Posto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Posto Central - Av. Liberdade" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Lisboa" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StationStatus)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INDISPONIVEL">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-5">
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="button" className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={submit} disabled={!canSave}>
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                A salvar...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

