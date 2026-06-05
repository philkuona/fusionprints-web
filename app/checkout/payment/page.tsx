"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/account/auth-guard";
import { formatPrice } from "@/lib/api/catalog";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import { createCheckout, confirmPayment } from "@/lib/api/orders";

type Phase = "review" | "creating" | "gateway" | "confirming" | "failed";

const PENDING_KEY = "fp_pending_order";

export default function PaymentPage() {
  return <AuthGuard>{() => <PaymentScreen />}</AuthGuard>;
}

function PaymentScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selection, setSelection] = useState<{ fulfillmentMethod: "collection" | "delivery"; deliveryZone?: string; addressId?: string | null } | null>(null);
  const [ready, setReady] = useState(false);

  const [phase, setPhase] = useState<Phase>("review");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => {
      setItems(getCart());
      try {
        const raw = window.localStorage.getItem("fp_checkout_v1");
        if (raw) setSelection(JSON.parse(raw));
        const pending = window.sessionStorage.getItem(PENDING_KEY);
        if (pending) {
          setOrderNumber(pending);
          setPhase("gateway");
        }
      } catch {
        /* ignore */
      }
      setReady(true);
    };
    load();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPriceUsd, 0);
  const unedited = items.filter((i) => !i.processedImageId);

  async function startPayment() {
    if (!selection) {
      setError("Your checkout details are missing. Please go back to checkout.");
      return;
    }
    setPhase("creating");
    setError("");
    try {
      const res = await createCheckout({
        items: items.map((i) => ({
          processedImageId: i.processedImageId as string,
          sizeCode: i.sizeCode,
          quantity: i.qty,
          paper: i.paper ?? null,
        })),
        fulfillmentMethod: selection.fulfillmentMethod,
        deliveryZone: selection.deliveryZone,
        addressId: selection.addressId ?? null,
      });
      setOrderNumber(res.orderNumber);
      window.sessionStorage.setItem(PENDING_KEY, res.orderNumber);
      setPhase("gateway");
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "Couldn't start payment. Please try again.";
      setError(msg);
      setPhase("review");
    }
  }

  async function approve() {
    if (!orderNumber) return;
    setPhase("confirming");
    setError("");
    try {
      const res = await confirmPayment(orderNumber, "success");
      if (res.status === "paid") {
        clearCart();
        window.localStorage.removeItem("fp_checkout_v1");
        window.sessionStorage.removeItem(PENDING_KEY);
        router.push(`/account/orders/${orderNumber}?placed=1`);
        return;
      }
      setPhase("gateway");
    } catch {
      setError("Couldn't confirm payment. Please try again.");
      setPhase("gateway");
    }
  }

  async function decline() {
    if (!orderNumber) return;
    try {
      await confirmPayment(orderNumber, "fail");
    } catch {
      /* ignore */
    }
    window.sessionStorage.removeItem(PENDING_KEY);
    setPhase("failed");
  }

  if (!ready) {
    return (
      <Container className="py-16">
        <div className="h-8 w-40 animate-pulse rounded-full bg-ink/5" />
      </Container>
    );
  }

  if (items.length === 0 && phase === "review") {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-fraunces text-3xl font-bold text-ink">Nothing to pay for</h1>
        <Link href="/prints" className="mt-8 inline-flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream">
          Browse prints
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-xl py-12">
      <h1 className="font-fraunces text-3xl font-bold text-ink">Payment</h1>

      {/* Virtualised-provider notice */}
      <p className="mt-3 rounded-lg bg-amber/10 px-3 py-2 text-xs text-ink-soft">
        Demo payment. No real charge is made. A live payment gateway will replace this step.
      </p>

      {(phase === "review" || phase === "creating") && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Total to pay</span>
            <span className="font-fraunces text-2xl font-bold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-mute">Delivery, if any, is added after this demo step.</p>

          {unedited.length > 0 && (
            <p className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
              {unedited.length} item{unedited.length === 1 ? "" : "s"} still need cropping. Please edit{" "}
              <Link href="/cart" className="cursor-pointer font-semibold underline">in your cart</Link> before paying.
            </p>
          )}

          {error && <p className="mt-4 text-sm text-coral">{error}</p>}

          <button
            type="button"
            onClick={startPayment}
            disabled={phase === "creating" || unedited.length > 0}
            className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {phase === "creating" ? "Starting…" : `Pay ${formatPrice(subtotal)}`}
          </button>
          <Link href="/checkout" className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink">
            Back to checkout
          </Link>
        </div>
      )}

      {(phase === "gateway" || phase === "confirming") && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-center">
          <p className="text-sm text-ink-soft">Approve this payment to place order</p>
          {orderNumber && <p className="mt-1 font-mono text-sm text-ink">{orderNumber}</p>}
          <p className="mt-3 text-xs text-ink-mute">
            This stands in for a real EcoCash prompt / card 3-D Secure approval.
          </p>
          {error && <p className="mt-3 text-sm text-coral">{error}</p>}
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={approve}
              disabled={phase === "confirming"}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:opacity-50"
            >
              {phase === "confirming" ? "Confirming…" : "Approve payment"}
            </button>
            <button
              type="button"
              onClick={decline}
              disabled={phase === "confirming"}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-ink/15 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {phase === "failed" && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-center">
          <p className="font-semibold text-ink">Payment declined</p>
          <p className="mt-1 text-sm text-ink-soft">Your order is saved as unpaid. You can try again.</p>
          <button
            type="button"
            onClick={() => {
              setPhase("gateway");
              if (orderNumber) window.sessionStorage.setItem(PENDING_KEY, orderNumber);
            }}
            className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Try again
          </button>
        </div>
      )}
    </Container>
  );
}
