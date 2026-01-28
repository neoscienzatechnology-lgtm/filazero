const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type Tokens = { accessToken: string; refreshToken: string };

export function getTokens(): Tokens | null {
  const raw = localStorage.getItem("fz.tokens");
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export function setTokens(tokens: Tokens | null) {
  if (!tokens) localStorage.removeItem("fz.tokens");
  else localStorage.setItem("fz.tokens", JSON.stringify(tokens));
}

export async function apiFetch<T>(
  path: string,
  opts?: { method?: string; body?: unknown; auth?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (opts?.auth) {
    const tokens = getTokens();
    if (tokens?.accessToken) headers.authorization = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.error?.message ?? `Erro HTTP ${res.status} ao chamar ${path}`;
    throw new Error(msg);
  }
  return json as T;
}

