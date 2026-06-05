"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/account/auth-guard";
import { formatPrice } from "@/lib/api/catalog";
import { getCart } from "@/lib/cart";

/**
 * Placeholder payment step (Phase 2.3 W2). The real virtualized payment
 * provider + order creation land in W3 — this just confirms the totals carry
 * through from checkout so the flow is navigable end to end.
 */
export default function PaymentPage() {
  return <AuthGuard>{() => <PaymentScreen />}</AuthGuard>;
}

function PaymentScreen() {
  const [subtotal, setSubtotal] = useState(0);
  const [fulfillment, setFulfillment] = useState<string>("collection");

  useEffect(() => {
    const load = () => {
      setSubtotal(getCart().reduce((s, i) => s + i.qty * i.unitPriceUsd, 0));
      try {
        const raw = window.localStorage.getItem("fp_checkout_v1");
        if (raw) setFulfillment((JSON.parse(raw).fulfillmentMethod as string) ?? "collection");
      } catch {
        /* ignore */
      }
    };
    load();
  }, []);

  return (
    <Container className="py-16 text-center">
      <h1 className="font-fraunces text-3xl font-bold text-ink">Payment</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        Fulfilment: <strong className="text-ink">{fulfillment}</strong> · Subtotal{" "}
        <strong className="text-ink">{formatPrice(subtotal)}</strong>
      </p>
      <p className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-ink/15 px-4 py-6 text-sm text-ink-mute">
        Payment is the next step we&rsquo;re building. It will use a virtualised provider for now,
        then a real gateway once one is available.
      </p>
      <Link
        href="/checkout"
        className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5"
      >
        Back to checkout
      </Link>
    </Container>
  );
}
