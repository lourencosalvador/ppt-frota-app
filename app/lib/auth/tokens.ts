export const ACCESS_TOKEN_KEY = "frota_plus_access_token";
export const REFRESH_TOKEN_KEY = "frota_plus_refresh_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(args: { access: string; refresh?: string | null }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, args.access);
  if (args.refresh) localStorage.setItem(REFRESH_TOKEN_KEY, args.refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

