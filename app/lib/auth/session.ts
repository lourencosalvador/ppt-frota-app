export type AppRole = "client" | "support" | "admin";

export type AppSession = {
  email: string;
  name: string;
  role: AppRole;
  createdAt: number;
};

export const SESSION_STORAGE_KEY = "frota_plus_session";

export function getStoredSession(): AppSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AppSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

