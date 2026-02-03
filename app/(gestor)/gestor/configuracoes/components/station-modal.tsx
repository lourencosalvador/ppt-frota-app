"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/app/lib/api/api-client";
import type { ApiStation, CreateStationBody } from "@/app/lib/api/stations";
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

type StationStatus = "ATIVO" | "INDISPONIVEL";

function numberOrZero(v: string) {
  const n = Number(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function StationModal({
  open,
  onOpenChange,
  initial,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ApiStation | null;
  onCreate: (body: CreateStationBody) => Promise<ApiStation> | ApiStation;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [latRaw, setLatRaw] = useState("0");
  const [lngRaw, setLngRaw] = useState("0");
  const [status, setStatus] = useState<StationStatus>("ATIVO");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const canSave = useMemo(
    () =>
      name.trim().length > 2 &&
      address.trim().length > 2 &&
      province.trim().length > 1 &&
      city.trim().length > 1 &&
      !isSaving,
    [name, address, province, city, isSaving],
  );

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setAddress(initial?.address ?? "");
    setProvince(initial?.province ?? "");
    setCity(initial?.city ?? "");
    setLatRaw(String(initial?.latitude ?? 0));
    setLngRaw(String(initial?.longitude ?? 0));
    setStatus(initial?.is_active === false ? "INDISPONIVEL" : "ATIVO");
    setIsSaving(false);
  }, [open, initial]);

  async function submit() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const payload: CreateStationBody = {
        name: name.trim(),
        address: address.trim(),
        province: province.trim(),
        city: city.trim(),
        latitude: numberOrZero(latRaw),
        longitude: numberOrZero(lngRaw),
        is_active: status === "ATIVO",
      };
      // create only (no update endpoint provided)
      if (isEdit) {
        toast.info("Edição de posto: endpoint ainda não disponível.");
        setIsSaving(false);
        onOpenChange(false);
        return;
      }
      const created = await onCreate(payload);
      if (created?.id) toast.success("Posto criado.");
      setIsSaving(false);
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error("Falha ao salvar posto.");
      setIsSaving(false);
    }
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

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Av. Liberdade, 123" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Província</Label>
              <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Ex: Luanda" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Talatona" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input value={latRaw} onChange={(e) => setLatRaw(e.target.value)} placeholder="0" inputMode="decimal" />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input value={lngRaw} onChange={(e) => setLngRaw(e.target.value)} placeholder="0" inputMode="decimal" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

