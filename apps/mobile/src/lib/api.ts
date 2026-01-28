const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(
  path: string,
  opts?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts?.method ?? "GET",
    headers: { "content-type": "application/json" },
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

