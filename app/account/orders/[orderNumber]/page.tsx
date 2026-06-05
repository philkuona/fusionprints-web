"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/api/catalog";
import { getOrder, orderStatusLabel, type OrderDetail } from "@/lib/api/orders";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Build the milestone timeline for the order's current status. */
function milestones(order: OrderDetail) {
  const s = order.status;
  const inProduction = ["queued_for_print", "printing", "printed", "ready_for_pickup", "ready_for_collection", "shipped", "fulfilled"].includes(s);
  const ready = ["ready_for_pickup", "ready_for_collection", "shipped", "fulfilled"].includes(s);
  const done = s === "fulfilled";
  const deliver = order.fulfillmentMethod === "delivery";
  return [
    { label: "Order placed", at: order.createdAt, done: true },
    { label: "Payment confirmed", at: order.paidAt, done: s !== "pending_payment" && s !== "cancelled" && s !== "failed" },
    { label: "In production", at: null, done: inProduction },
    { label: deliver ? "Out for delivery" : "Ready for pickup", at: deliver ? order.shippedAt : order.readyAt, done: ready },
    { label: "Completed", at: order.fulfilledAt, done },
  ];
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const initPlaced = () => setPlaced(new URLSearchParams(window.location.search).get("placed") === "1");
    initPlaced();
    let active = true;
    getOrder(orderNumber)
      .then((o) => active && setOrder(o))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />;
  }

  if (error || !order) {
    return (
      <div>
        <p className="text-sm text-coral">We couldn&rsquo;t find that order.</p>
        <Link href="/account/orders" className="mt-4 inline-block cursor-pointer text-sm font-semibold text-malachite-deep hover:text-ink">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/account/orders" className="cursor-pointer text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink">
        ← Orders
      </Link>

      {placed && (
        <p className="mt-4 rounded-xl bg-malachite/15 px-4 py-3 text-sm font-medium text-ink">
          Thank you — your order is placed! Track its progress below.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-fraunces text-2xl font-bold text-ink">{order.orderNumber}</h1>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-soft">
          {orderStatusLabel(order.status)}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-mute">Placed {formatDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        {/* Timeline + items */}
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mute">Progress</h2>
            <ol className="mt-4 space-y-4">
              {milestones(order).map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${m.done ? "bg-malachite text-ink" : "border border-ink/20 bg-white"}`}>
                    {m.done && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className={`text-sm ${m.done ? "font-medium text-ink" : "text-ink-mute"}`}>{m.label}</span>
                    {m.at && <span className="block text-xs text-ink-mute">{formatDate(m.at)}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mute">Items</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                    {it.previewUrl && <Image src={it.previewUrl} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{it.label} print</p>
                    <p className="text-xs text-ink-mute">
                      {[it.paper ? it.paper : null, `Qty ${it.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm text-ink">{formatPrice(Number(it.lineTotalUsd))}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-3 rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-fraunces text-lg font-bold text-ink">Summary</h2>
          <Row label="Subtotal" value={formatPrice(Number(order.subtotalUsd))} />
          <Row label="Delivery" value={Number(order.deliveryFeeUsd) > 0 ? formatPrice(Number(order.deliveryFeeUsd)) : "Free"} />
          <div className="border-t border-ink/10 pt-2">
            <Row label="Total" value={formatPrice(Number(order.totalUsd))} bold />
          </div>
          <div className="border-t border-ink/10 pt-3 text-sm">
            <p className="font-medium text-ink">{order.fulfillmentMethod === "delivery" ? "Delivery" : "Collection"}</p>
            {order.deliveryAddress && <p className="mt-1 text-xs text-ink-soft">{order.deliveryAddress}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold text-ink" : "text-ink-soft"}>{label}</span>
      <span className={bold ? "font-semibold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
