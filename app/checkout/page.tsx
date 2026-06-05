"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/account/auth-guard";
import { formatPrice } from "@/lib/api/catalog";
import { type CartItem, getCart, subscribeCart } from "@/lib/cart";
import {
  type Address,
  type AddressInput,
  getAddresses,
  createAddress,
} from "@/lib/api/addresses";

type Fulfillment = "collection" | "delivery";

// Delivery zones mirror the backend DELIVERY_FEES (config/catalog.ts). Not yet
// exposed via API, so kept in sync here. `fee: null` = quoted separately.
const ZONES: { key: string; label: string; fee: number | null }[] = [
  { key: "harare_cbd", label: "Harare CBD", fee: 3 },
  { key: "harare_greater", label: "Greater Harare", fee: 5 },
  { key: "outside_harare", label: "Outside Harare (quoted)", fee: null },
];

const CHECKOUT_KEY = "fp_checkout_v1";

export default function CheckoutPage() {
  return <AuthGuard>{() => <CheckoutScreen />}</AuthGuard>;
}

function CheckoutScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const [fulfillment, setFulfillment] = useState<Fulfillment>("collection");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [zone, setZone] = useState<string>("harare_cbd");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(getCart());
      setReady(true);
    };
    sync();
    return subscribeCart(sync);
  }, []);

  useEffect(() => {
    let active = true;
    getAddresses()
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => active && setAddresses([]))
      .finally(() => active && setAddrLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPriceUsd, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const zoneObj = ZONES.find((z) => z.key === zone);
  const deliveryFee = fulfillment === "delivery" ? zoneObj?.fee ?? 0 : 0;
  const total = subtotal + deliveryFee;

  const canContinue =
    items.length > 0 &&
    (fulfillment === "collection" || (Boolean(selectedAddressId) && Boolean(zone)));

  function onContinue() {
    if (!canContinue) return;
    const selection = {
      fulfillmentMethod: fulfillment,
      deliveryZone: fulfillment === "delivery" ? zone : "collection",
      addressId: fulfillment === "delivery" ? selectedAddressId : null,
    };
    window.localStorage.setItem(CHECKOUT_KEY, JSON.stringify(selection));
    router.push("/checkout/payment");
  }

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
        <h1 className="font-fraunces text-3xl font-bold text-ink">Nothing to check out</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">Your cart is empty.</p>
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
      <h1 className="font-fraunces text-3xl font-bold text-ink">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Fulfillment toggle */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mute">How would you like it?</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FulfillmentCard
                active={fulfillment === "collection"}
                onClick={() => setFulfillment("collection")}
                title="Collection"
                sub="Pick up from our studio, free"
              />
              <FulfillmentCard
                active={fulfillment === "delivery"}
                onClick={() => setFulfillment("delivery")}
                title="Delivery"
                sub="We bring it to you"
              />
            </div>
          </section>

          {fulfillment === "collection" ? (
            <section className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink-soft">
              We&rsquo;ll send pickup details once your order is printed and ready. Collection is free.
            </section>
          ) : (
            <>
              {/* Delivery area */}
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mute">Delivery area</h2>
                <div className="mt-3 space-y-2">
                  {ZONES.map((z) => (
                    <label
                      key={z.key}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200 ${zone === z.key ? "border-malachite bg-malachite/10" : "border-ink/15 hover:border-ink/30"}`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="zone"
                          checked={zone === z.key}
                          onChange={() => setZone(z.key)}
                          className="h-4 w-4 cursor-pointer accent-malachite"
                        />
                        <span className="text-sm font-medium text-ink">{z.label}</span>
                      </span>
                      <span className="text-sm text-ink-soft">{z.fee === null ? "Quoted" : formatPrice(z.fee)}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Address */}
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-mute">Delivery address</h2>
                  {!showForm && (
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="cursor-pointer text-sm font-semibold text-malachite-deep transition-colors duration-200 hover:text-ink"
                    >
                      + Add new
                    </button>
                  )}
                </div>

                {addrLoading ? (
                  <div className="mt-3 h-20 animate-pulse rounded-xl bg-ink/5" />
                ) : (
                  <div className="mt-3 space-y-2">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${selectedAddressId === a.id ? "border-malachite bg-malachite/10" : "border-ink/15 hover:border-ink/30"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1 h-4 w-4 cursor-pointer accent-malachite"
                        />
                        <span className="text-sm">
                          <span className="font-medium text-ink">{a.recipientName}</span>
                          <span className="block text-ink-soft">
                            {a.addressLine1}
                            {a.suburb ? `, ${a.suburb}` : ""}, {a.city}
                          </span>
                        </span>
                      </label>
                    ))}

                    {showForm && (
                      <AddressForm
                        onCancel={() => setShowForm(false)}
                        onSaved={(addr) => {
                          setAddresses((prev) => [addr, ...prev.filter((p) => p.id !== addr.id)]);
                          setSelectedAddressId(addr.id);
                          setShowForm(false);
                        }}
                      />
                    )}

                    {!showForm && addresses.length === 0 && (
                      <p className="rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink-mute">
                        No saved addresses yet. Add one to continue.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5 lg:sticky lg:top-20">
          <h2 className="font-fraunces text-lg font-bold text-ink">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label={`Subtotal (${count} ${count === 1 ? "print" : "prints"})`} value={formatPrice(subtotal)} />
            <Row
              label="Delivery"
              value={
                fulfillment === "collection"
                  ? "Free"
                  : zoneObj?.fee === null
                    ? "Quoted"
                    : formatPrice(deliveryFee)
              }
            />
            <div className="border-t border-ink/10 pt-2">
              <Row label="Total" value={formatPrice(total)} bold />
            </div>
          </div>
          {fulfillment === "delivery" && zoneObj?.fee === null && (
            <p className="mt-2 text-xs text-ink-mute">Delivery outside Harare is quoted separately after you order.</p>
          )}
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to payment
          </button>
          <Link
            href="/cart"
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-full text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </Container>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold text-ink" : "text-ink-soft"}>{label}</span>
      <span className={bold ? "font-semibold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}

function FulfillmentCard({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${active ? "border-malachite bg-malachite/10" : "border-ink/15 hover:border-ink/30"}`}
    >
      <span className="block text-sm font-semibold text-ink">{title}</span>
      <span className="mt-0.5 block text-xs text-ink-mute">{sub}</span>
    </button>
  );
}

function AddressForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: (addr: Address) => void;
}) {
  const [form, setForm] = useState<AddressInput>({ recipientName: "", addressLine1: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.recipientName.trim() || !form.addressLine1.trim() || !form.city.trim()) {
      setErr("Recipient, address, and city are required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const addr = await createAddress(form);
      onSaved(addr);
    } catch {
      setErr("Couldn't save the address. Please try again.");
      setSaving(false);
    }
  }

  const field = "w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-malachite";

  return (
    <div className="space-y-2 rounded-xl border border-ink/15 bg-cream p-4">
      <input className={field} placeholder="Recipient name" value={form.recipientName} onChange={set("recipientName")} />
      <input className={field} placeholder="Address line" value={form.addressLine1} onChange={set("addressLine1")} />
      <div className="grid grid-cols-2 gap-2">
        <input className={field} placeholder="Suburb (optional)" value={form.suburb ?? ""} onChange={set("suburb")} />
        <input className={field} placeholder="City" value={form.city} onChange={set("city")} />
      </div>
      <input className={field} placeholder="Delivery instructions (optional)" value={form.deliveryInstructions ?? ""} onChange={set("deliveryInstructions")} />
      {err && <p className="text-xs text-coral">{err}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 cursor-pointer items-center justify-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
