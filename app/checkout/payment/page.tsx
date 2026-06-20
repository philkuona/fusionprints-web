"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/account/auth-guard";
import { formatPrice } from "@/lib/api/catalog";
import { getCart, clearCart, hasFiveBySeven, type CartItem } from "@/lib/cart";
import { createCheckout, confirmPayment, getOrder } from "@/lib/api/orders";
import { loadPayonifySdk, PAYONIFY_PUBLISHABLE_KEY, type PayonifyInstance } from "@/lib/payonify";

type Phase = "review" | "creating" | "gateway" | "confirming" | "failed";

const PENDING_KEY = "fp_pending_order";

export default function PaymentPage() {
  return <AuthGuard>{() => <PaymentScreen />}</AuthGuard>;
}

function PaymentScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selection, setSelection] = useState<{ fulfillmentMethod: "collection" | "delivery"; deliveryZone?: string; addressId?: string | null; phone?: string } | null>(null);
  const [ready, setReady] = useState(false);

  const [phase, setPhase] = useState<Phase>("review");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  // Authoritative amount Payonify will charge (server-computed order total).
  const [chargeUsd, setChargeUsd] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mountedSecretRef = useRef<string | null>(null); // guards against double-mount

  useEffect(() => {
    const init = () => {
      setItems(getCart());
      try {
        const raw = window.localStorage.getItem("fp_checkout_v1");
        if (raw) setSelection(JSON.parse(raw));
        // Deliberately do NOT restore a prior checkout session: the cart may
        // have changed since, so each payment attempt creates a fresh session
        // for the current cart (a stale session charges the wrong amount).
      } catch {
        /* ignore */
      }
      setReady(true);
    };
    init();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPriceUsd, 0);
  // Composite items (wallet/passport/mini) are complete via their layout — they
  // have no single processedImageId, so don't flag them as "needs editing".
  const unedited = items.filter((i) => i.productType !== "composite" && !i.processedImageId);

  function finishPaid(order: string) {
    clearCart();
    window.localStorage.removeItem("fp_checkout_v1");
    window.sessionStorage.removeItem(PENDING_KEY);
    router.push(`/account/orders/${order}?placed=1`);
  }

  // Mount the Payonify Drop-In once the modal is open and the container exists.
  useEffect(() => {
    if (!modalOpen || !clientSecret || !orderNumber) return;
    const container = containerRef.current;
    if (!container) return;
    if (mountedSecretRef.current === clientSecret) return; // already mounted
    if (!PAYONIFY_PUBLISHABLE_KEY) return; // guarded before opening the modal

    let cancelled = false;
    mountedSecretRef.current = clientSecret;
    // Async work + SDK callbacks run after this effect returns, so their
    // setState calls aren't "synchronous-in-effect".
    void (async () => {
      try {
        const Payonify = await loadPayonifySdk();
        if (cancelled) return;
        const pay: PayonifyInstance = new Payonify({ publishableKey: PAYONIFY_PUBLISHABLE_KEY });
        pay.onSuccess = () => finishPaid(orderNumber);
        pay.onError = (err) => {
          // Full payload to the console so we can see Payonify's actual reason.
          console.error("Payonify onError:", err);
          const msg = (err as { message?: string })?.message ?? "Payment failed. Please try again.";
          setError(msg);
        };
        pay.onClose = () => {
          setModalOpen(false);
          mountedSecretRef.current = null; // allow a fresh mount on resume
        };
        pay.mount({ container, clientSecret });
      } catch (e) {
        mountedSecretRef.current = null;
        setError((e as Error).message ?? "Couldn't load the payment form.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, clientSecret, orderNumber]);

  // While a Payonify payment is in progress, poll the order — the webhook is the
  // source of truth. EcoCash confirms asynchronously (approved on the phone),
  // so the SDK's immediate callbacks aren't reliable; when the order flips off
  // pending_payment we treat it as paid and continue.
  useEffect(() => {
    const isPay = !!clientSecret;
    if (phase !== "gateway" || !isPay || !orderNumber) return;
    let active = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      tries += 1;
      try {
        const o = await getOrder(orderNumber);
        if (active && o.status && o.status !== "pending_payment") {
          finishPaid(orderNumber); // webhook confirmed → paid
          return;
        }
        if (active && o.paymentStatus === "failed") {
          // Gateway reported a failed charge — stop waiting, let them retry.
          setError("Your payment didn't go through. No charge was made. Please try again.");
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      if (!active) return;
      if (tries < 40) {
        timer = setTimeout(tick, 3000); // ~2 min total
      } else {
        setError("We haven't received payment confirmation yet. If you completed payment, check My Orders shortly.");
      }
    };
    timer = setTimeout(tick, 3000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, clientSecret, orderNumber]);

  async function startPayment() {
    if (!selection) {
      setError("Your checkout details are missing. Please go back to checkout.");
      return;
    }
    if (!selection.phone) {
      setError("A contact number is required. Please go back to checkout and add one.");
      return;
    }
    setPhase("creating");
    setError("");
    try {
      const res = await createCheckout({
        items: items.map((i) =>
          i.productType === "composite"
            ? {
                sizeCode: i.sizeCode,
                quantity: i.qty,
                productType: "composite" as const,
                layoutPayload: i.layoutPayload,
              }
            : {
                processedImageId: i.processedImageId as string,
                sizeCode: i.sizeCode,
                quantity: i.qty,
                paper: i.paper ?? null,
              },
        ),
        fulfillmentMethod: selection.fulfillmentMethod,
        deliveryZone: selection.deliveryZone,
        addressId: selection.addressId ?? null,
        phone: selection.phone,
      });
      setOrderNumber(res.orderNumber);
      setChargeUsd(res.totalUsd); // authoritative charge amount for this order
      window.sessionStorage.setItem(PENDING_KEY, res.orderNumber);
      if (res.clientSecret) {
        if (!PAYONIFY_PUBLISHABLE_KEY) {
          setError("Payment isn't configured (missing publishable key). Please contact support.");
          setPhase("review");
          return;
        }
        // Real gateway (Payonify embedded) — open a FRESH Drop-In for this order.
        setClientSecret(res.clientSecret);
        mountedSecretRef.current = null;
        setModalOpen(true);
      }
      setPhase("gateway");
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "Couldn't start payment. Please try again.";
      setError(msg);
      setPhase("review");
    }
  }

  // ── Mock provider (no clientSecret) confirm/decline ───────────────────────
  async function approve() {
    if (!orderNumber) return;
    setPhase("confirming");
    setError("");
    try {
      const res = await confirmPayment(orderNumber, "success");
      if (res.status === "paid") {
        finishPaid(orderNumber);
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

  const isPayonify = !!clientSecret;

  return (
    <Container className="max-w-xl py-12">
      <h1 className="font-fraunces text-3xl font-bold text-ink">Payment</h1>

      {/* Mock-provider notice only (real gateway has no banner) */}
      {!isPayonify && (
        <p className="mt-3 rounded-lg bg-amber/10 px-3 py-2 text-xs text-ink-soft">
          Demo payment. No real charge is made. A live payment gateway will replace this step.
        </p>
      )}

      {(phase === "review" || phase === "creating") && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Total to pay</span>
            <span className="font-fraunces text-2xl font-bold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-mute">Delivery, if any, is added before payment.</p>

          {/* Next-day notice for orders with a 5×7 (whole order). Positive framing,
              reason never exposed — final copy lives in the brand-copy layer. */}
          {hasFiveBySeven(items) && (
            <p className="mt-4 rounded-xl bg-malachite/15 px-4 py-3 text-sm text-ink">
              ✨ Your order is one of our special ones. We give these a little extra love in the studio, so it’ll be ready the next working day. We’ll let you know the moment it’s ready.
            </p>
          )}

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

      {/* Payonify gateway — Drop-In closed. While the order is still pending we
          keep polling (EcoCash confirms asynchronously), showing "Confirming…".
          Only after the poll times out (error set) do we offer to retry. */}
      {phase === "gateway" && isPayonify && !modalOpen && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-center">
          {error ? (
            <>
              <p className="font-semibold text-ink">Payment not confirmed</p>
              {orderNumber && <p className="mt-1 font-mono text-sm text-ink">{orderNumber}</p>}
              <p className="mt-3 text-sm text-coral">{error}</p>
              <button
                type="button"
                onClick={() => { setError(""); mountedSecretRef.current = null; setModalOpen(true); }}
                className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Try payment again
              </button>
              <Link href="/account/orders" className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink">
                View My Orders
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
              <p className="mt-4 text-sm font-medium text-ink">Confirming your payment…</p>
              <p className="mt-1 text-xs text-ink-mute">
                If you approved on your phone (EcoCash), this takes a few seconds. Please don&rsquo;t close this page.
              </p>
            </>
          )}
        </div>
      )}

      {/* Mock gateway approve/decline (only when not Payonify) */}
      {(phase === "gateway" || phase === "confirming") && !isPayonify && (
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

      {/* Payonify Drop-In modal — we provide the chrome, the SDK fills the container */}
      {isPayonify && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-cream p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-ink">Pay {formatPrice(chargeUsd != null ? Number(chargeUsd) : subtotal)}</h2>
                {orderNumber && <p className="font-mono text-xs text-ink-mute">{orderNumber}</p>}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { setModalOpen(false); mountedSecretRef.current = null; }}
                className="cursor-pointer text-ink-mute transition-colors duration-200 hover:text-ink"
              >
                ✕
              </button>
            </div>
            {error && <p className="mb-3 text-sm text-coral">{error}</p>}
            {/* Payonify mounts the EcoCash / OneMoney / card form here */}
            <div ref={containerRef} id="payonify-container" className="min-h-[180px]" />
          </div>
        </div>
      )}
    </Container>
  );
}
