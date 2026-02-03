import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/app/lib/auth/tokens";

export type ApiErrorBody = {
  detail?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function baseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const url = `${baseUrl()}/user/token/refresh/`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }),
        credentials: "include",
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = (await res.json()) as { access?: string };
      if (!data?.access) return null;
      setTokens({ access: data.access, refresh: null });
      return data.access;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  async function doFetch(overrideAccessToken?: string | null) {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    const token = overrideAccessToken ?? getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let body: BodyInit | undefined;
    if (init && "body" in init) {
      if (init.body === undefined || init.body === null) {
        body = undefined;
      } else if (
        typeof init.body === "string" ||
        init.body instanceof FormData ||
        init.body instanceof Blob
      ) {
        body = init.body as BodyInit;
      } else {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(init.body);
      }
    }

    const res = await fetch(url, {
      ...init,
      headers,
      body,
      credentials: init?.credentials ?? "include",
    });
    return res;
  }

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) res = await doFetch(refreshed);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const parsed = isJson ? ((await res.json().catch(() => null)) as ApiErrorBody | null) : null;
    const message = parsed?.detail || `Falha na requisição (${res.status}).`;
    throw new ApiError(message, res.status, parsed);
  }

  if (res.status === 204) return undefined as T;
  if (!isJson) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}

