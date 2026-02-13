"use client";

import { useRef, useState } from "react";
import { Camera, KeyRound, Mail, Save, User } from "lucide-react";
import { toast } from "sonner";

import { getStoredSession } from "@/app/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InitialsAvatar from "@/components/ui/initials-avatar";

export default function ProfileSettings() {
  const session = getStoredSession();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSaveProfile() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.info("Atualização de perfil: funcionalidade em integração com a API.");
    }, 600);
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    toast.info("Alteração de senha: funcionalidade em integração com a API.");
  }

  function handlePhotoUpload() {
    toast.info("Upload de foto: funcionalidade em integração com a API.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Profile Photo */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <h2 className="text-sm font-extrabold text-zinc-900">Foto de Perfil</h2>
        <p className="mt-1 text-xs font-semibold text-zinc-500">Personaliza a tua imagem de perfil.</p>
        <div className="mt-5 flex items-center gap-5">
          <div className="relative">
            <InitialsAvatar name={name || "U"} size={72} className="border-2 border-zinc-200" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900">{name || "Utilizador"}</div>
            <div className="text-xs font-semibold text-zinc-500">{email}</div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <h2 className="text-sm font-extrabold text-zinc-900">Informações Pessoais</h2>
        <p className="mt-1 text-xs font-semibold text-zinc-500">Atualiza o teu nome e email.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nome</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome completo"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="h-10 rounded-xl bg-emerald-600 px-6 text-sm font-semibold hover:bg-emerald-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "A guardar..." : "Guardar Alterações"}
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-zinc-100/60 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <h2 className="text-sm font-extrabold text-zinc-900">Alterar Palavra-passe</h2>
        <p className="mt-1 text-xs font-semibold text-zinc-500">Atualiza a tua senha de acesso.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-600">Palavra-passe atual</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-600">Nova palavra-passe</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-600">Confirmar nova palavra-passe</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleChangePassword}
            variant="outline"
            className="h-10 rounded-xl px-6 text-sm font-semibold"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Alterar Senha
          </Button>
        </div>
      </div>
    </div>
  );
}
