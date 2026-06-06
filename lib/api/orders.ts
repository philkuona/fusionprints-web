/** Web order + checkout API client. */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
}

export interface CheckoutItem {
  processedImageId: string;
  sizeCode: string;
  quantity: number;
  paper?: string | null;
}

export interface CheckoutInput {
  items: CheckoutItem[];
  fulfillmentMethod: "collection" | "delivery";
  deliveryZone?: string;
  addressId?: string | null;
  phone: string;
}

export interface CheckoutResult {
  orderNumber: string;
  reference: string;
  status: string;
  totalUsd: string;
}

export const createCheckout = (data: CheckoutInput) =>
  api<CheckoutResult>("/web/api/checkout", { method: "POST", body: JSON.stringify(data) });

export const confirmPayment = (orderNumber: string, outcome: "success" | "fail") =>
  api<{ status: string; orderNumber: string }>(`/web/api/checkout/${orderNumber}/confirm`, {
    method: "POST",
    body: JSON.stringify({ outcome }),
  });

export interface OrderSummary {
  orderNumber: string;
  status: string;
  totalUsd: string;
  fulfillmentMethod: "collection" | "delivery";
  createdAt: string;
  prints: number;
  thumbnailUrl: string | null;
}

export interface OrderItemDetail {
  sizeCode: string;
  label: string;
  quantity: number;
  paper: string | null;
  unitPriceUsd: string;
  lineTotalUsd: string;
  previewUrl: string | null;
}

export interface OrderDetail {
  orderNumber: string;
  status: string;
  subtotalUsd: string;
  deliveryFeeUsd: string;
  totalUsd: string;
  fulfillmentMethod: "collection" | "delivery";
  deliveryAddress: string | null;
  createdAt: string;
  paidAt: string | null;
  readyAt: string | null;
  shippedAt: string | null;
  fulfilledAt: string | null;
  items: OrderItemDetail[];
}

export const getOrders = () => api<OrderSummary[]>("/web/api/orders");
export const getOrder = (orderNumber: string) => api<OrderDetail>(`/web/api/orders/${orderNumber}`);

/** Human label for an order status. */
export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "Pending payment",
    paid: "Paid",
    awaiting_approval: "In review",
    queued_for_print: "Queued for print",
    printing: "Printing",
    printed: "Printed",
    ready_for_pickup: "Ready for pickup",
    ready_for_collection: "Ready for collection",
    shipped: "Shipped",
    fulfilled: "Completed",
    cancelled: "Cancelled",
    failed: "Failed",
  };
  return map[status] ?? status;
}
