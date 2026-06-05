"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/api/catalog";
import { getOrders, orderStatusLabel, type OrderSummary } from "@/lib/api/orders";

function statusClasses(status: string): string {
  if (["fulfilled", "ready_for_pickup", "ready_for_collection", "shipped"].includes(status)) return "bg-malachite/15 text-ink";
  if (["cancelled", "failed"].includes(status)) return "bg-coral/10 text-coral";
  if (status === "pending_payment") return "bg-amber/10 text-ink-soft";
  return "bg-ink/5 text-ink-soft";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getOrders()
      .then((o) => active && setOrders(o))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-bold text-ink">Orders</h1>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 text-sm text-coral">Couldn&rsquo;t load your orders. Please refresh.</p>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <p className="text-ink-soft">No orders yet.</p>
          <Link
            href="/prints"
            className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Start an order
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.orderNumber}>
              <Link
                href={`/account/orders/${o.orderNumber}`}
                className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-3 transition-colors duration-200 hover:border-ink/25 sm:p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                  {o.thumbnailUrl && (
                    <Image src={o.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink">{o.orderNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClasses(o.status)}`}>
                      {orderStatusLabel(o.status)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-mute">
                    {formatDate(o.createdAt)} · {o.prints} {o.prints === 1 ? "print" : "prints"} · {o.fulfillmentMethod}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-ink">{formatPrice(Number(o.totalUsd))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
