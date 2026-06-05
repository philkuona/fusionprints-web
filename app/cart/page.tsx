"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/api/catalog";
import {
  type CartItem,
  getCart,
  subscribeCart,
  setCartQty,
  removeFromCart,
} from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(getCart());
      setReady(true);
    };
    sync();
    return subscribeCart(sync);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPriceUsd, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);

  if (!ready) {
    return (
      <Container className="py-16">
        <div className="h-8 w-40 animate-pulse rounded-full bg-ink/5" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-fraunces text-3xl font-bold text-ink">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Pick a size, upload your photos, and make something worth keeping.
        </p>
        <Link
          href="/prints"
          className="mt-8 inline-flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          Browse prints
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-fraunces text-3xl font-bold text-ink">
        Your cart <span className="text-ink-mute">({count})</span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Items */}
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-3 sm:p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ink/5 sm:h-28 sm:w-28">
                <Image
                  src={item.processedUrl ?? item.storageUrl}
                  alt={`${item.label} print`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.label} print</p>
                    <p className="mt-0.5 text-xs text-ink-mute">
                      {[
                        item.paper ? cap(item.paper) : null,
                        item.border ? "White border" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Standard finish"}
                    </p>
                    {!item.processedImageId && (
                      <p className="mt-1 text-xs text-amber">Not yet edited — fitted at checkout</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.label} print`}
                    className="shrink-0 cursor-pointer rounded-full p-1.5 text-ink-mute transition-colors duration-200 hover:bg-ink/5 hover:text-coral"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2 rounded-full border border-ink/15">
                    <button
                      type="button"
                      onClick={() => setCartQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-ink transition-colors duration-200 hover:bg-ink/5"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center font-mono text-sm text-ink">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setCartQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-ink transition-colors duration-200 hover:bg-ink/5"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-ink">{formatPrice(item.qty * item.unitPriceUsd)}</p>
                    <p className="text-xs text-ink-mute">{formatPrice(item.unitPriceUsd)} each</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5 lg:sticky lg:top-20">
          <h2 className="font-fraunces text-lg font-bold text-ink">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-soft">Subtotal ({count} {count === 1 ? "print" : "prints"})</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink-mute">Delivery or collection is chosen at checkout.</p>
          <Link
            href="/checkout"
            className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/prints"
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-full text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Keep shopping
          </Link>
        </aside>
      </div>
    </Container>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
