import { apiFetch } from "@/app/lib/api/api-client";
import { clearTokens, setTokens } from "@/app/lib/auth/tokens";
import { SESSION_STORAGE_KEY, type AppRole, type AppSession } from "@/app/lib/auth/session";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  type: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: ApiUser;
};

export function mapUserTypeToRole(type: string): AppRole {
  const t = String(type || "").toLowerCase();
  if (t === "admin" || t === "gestor") return "admin";
  if (t === "support" || t === "suporte") return "support";
  return "client";
}

export function persistAuth(auth: AuthResponse) {
  setTokens({ access: auth.access, refresh: auth.refresh });
  const session: AppSession = {
    email: auth.user.email,
    name: auth.user.name,
    role: mapUserTypeToRole(auth.user.type),
    createdAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export async function login(email: string, password: string) {
  const auth = await apiFetch<AuthResponse>("/user/token/", {
    method: "POST",
    body: { email, password },
  });
  return persistAuth(auth);
}

export async function signup(args: { name: string; email: string; password: string; type?: string }) {
  const auth = await apiFetch<AuthResponse>("/user/signup/", {
    method: "POST",
    body: { name: args.name, email: args.email, password: args.password, type: args.type ?? "client" },
  });
  return persistAuth(auth);
}

export async function getMe() {
  return apiFetch<ApiUser>("/user/");
}

export async function logout() {
  try {
    await apiFetch<void>("/user/logout/", { method: "POST" });
  } finally {
    clearTokens();
    if (typeof window !== "undefined") localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export async function requestPasswordReset(email: string) {
  return apiFetch<{ message: string; code?: string }>("/user/password/reset/", {
    method: "POST",
    body: { email },
  });
}

export async function confirmPasswordReset(args: { email: string; code: string; new_password: string }) {
  return apiFetch<{ message?: string } | { detail?: string }>(
    "/user/password/reset/confirm/",
    { method: "POST", body: args },
  );
}

