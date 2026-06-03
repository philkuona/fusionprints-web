/**
 * Client-side cart (Phase 2.2 placeholder). Persists staged print line items to
 * localStorage so the editor's "Add to Cart" has somewhere to go. The real
 * server-backed cart + checkout + payment are Phase 2.3 — this is intentionally
 * minimal and will be replaced.
 */

export interface CartItem {
  id: string; // `${photoId}:${sizeCode}`
  photoId: string;
  storageUrl: string;
  sizeCode: string;
  label: string; // e.g. "8×10 in"
  qty: number;
  unitPriceUsd: number;
  paper?: string; // "glossy" | "satin" | "lustre"
  border?: boolean; // 1/2" white border
}

const KEY = "fp_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/** Append items, merging quantities for any matching id already in the cart. */
export function addToCart(items: CartItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;
  const byId = new Map(getCart().map((i) => [i.id, i]));
  for (const item of items) {
    const existing = byId.get(item.id);
    byId.set(item.id, existing ? { ...existing, qty: existing.qty + item.qty } : item);
  }
  window.localStorage.setItem(KEY, JSON.stringify([...byId.values()]));
}

export function cartCount(): number {
  return getCart().reduce((n, i) => n + i.qty, 0);
}
