/**
 * Server-backed cart API — lets a logged-in customer pick up the same cart on
 * another device. All calls send the session cookie; a 401 (not signed in)
 * surfaces as a thrown error the caller treats as "local-only".
 */

import type { CartItem } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`cart request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getServerCart() {
  return req<{ items: CartItem[]; updatedAt: string | null }>("/web/api/cart");
}

export function putServerCart(items: CartItem[]) {
  return req<{ ok: true }>("/web/api/cart", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export function deleteServerCart() {
  return req<{ ok: true }>("/web/api/cart", { method: "DELETE" });
}
