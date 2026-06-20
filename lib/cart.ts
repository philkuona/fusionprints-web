/**
 * Client-side cart (Phase 2.3). Staged print line items live in localStorage;
 * the server-side order is created at checkout. Each item carries the editor's
 * print-ready render (processedImageId/processedUrl) when the photo was edited,
 * so checkout can place the order against the exact render the customer saw.
 *
 * Mutations dispatch a "fp-cart-change" event so the header badge and cart page
 * stay in sync (and "storage" keeps multiple tabs consistent).
 */

export interface CartItem {
  id: string; // `${photoId}:${sizeCode}`
  photoId: string;
  storageUrl: string; // original photo (preview fallback)
  sizeCode: string;
  label: string; // e.g. "8×10 in"
  qty: number;
  unitPriceUsd: number;
  paper?: string; // "glossy" | "lustre"
  border?: boolean; // white border selected
  orientation?: string; // "portrait" | "landscape" | "square"
  processedImageId?: string; // processed_images.id from the editor's Save
  processedUrl?: string; // print-ready render preview
  // Composite products (wallet/passport/mini): the per-cell layout from the
  // composite editor. Carried through checkout into order_items.layout_payload.
  productType?: "composite";
  layoutPayload?: unknown;
}

const KEY = "fp_cart_v1";
const EVENT = "fp-cart-change";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * True if any cart item is a 5×7 print. Such orders are operator-gated (printed
 * on swapped media) so the WHOLE order becomes next-working-day — surfaced as a
 * pre-checkout notice. Keep the size code in sync with the catalog 5×7 product.
 */
export function hasFiveBySeven(items: CartItem[]): boolean {
  return items.some((i) => i.sizeCode === "5x7");
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

/** Append items, merging quantities (and refreshing details) for matching ids. */
export function addToCart(items: CartItem[]): void {
  if (items.length === 0) return;
  const byId = new Map(getCart().map((i) => [i.id, i]));
  for (const item of items) {
    const existing = byId.get(item.id);
    byId.set(item.id, existing ? { ...existing, ...item, qty: existing.qty + item.qty } : item);
  }
  writeCart([...byId.values()]);
}

/** Set an item's quantity. A quantity of 0 (or less) removes it. */
export function setCartQty(id: string, qty: number): void {
  if (qty <= 0) return removeFromCart(id);
  writeCart(getCart().map((i) => (i.id === id ? { ...i, qty } : i)));
}

export function removeFromCart(id: string): void {
  writeCart(getCart().filter((i) => i.id !== id));
}

export function clearCart(): void {
  writeCart([]);
}

export function cartCount(): number {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

/** Subscribe to cart changes (same-tab writes + cross-tab storage events). */
export function subscribeCart(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
