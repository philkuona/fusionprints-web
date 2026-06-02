"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AddressInput } from "@/lib/api/addresses";

const LABELS = ["Home", "Office", "Family", "Other"];

interface AddressFormProps {
  initial?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => Promise<unknown>;
  submitLabel?: string;
}

export function AddressForm({ initial = {}, onSubmit, submitLabel = "Save address" }: AddressFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AddressInput>({
    label: initial.label ?? "Home",
    recipientName: initial.recipientName ?? "",
    addressLine1: initial.addressLine1 ?? "",
    suburb: initial.suburb ?? "",
    city: initial.city ?? "",
    deliveryInstructions: initial.deliveryInstructions ?? "",
    isDefault: initial.isDefault ?? false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const set = (field: keyof AddressInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await onSubmit(form);
      router.push("/account/addresses");
    } catch (err: unknown) {
      setStatus("error");
      setError((err as { message?: string })?.message ?? "Something went wrong.");
    }
  };

  const field = (id: keyof AddressInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}{!props.required && <span className="ml-1 font-normal text-ink-mute">(optional)</span>}
      </label>
      <input
        id={id}
        value={form[id] as string ?? ""}
        onChange={set(id)}
        className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder-ink-mute outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Label */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-ink">Label</label>
        <select
          id="label"
          value={form.label}
          onChange={set("label")}
          className="mt-1.5 block w-full cursor-pointer rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-colors duration-200 focus:border-malachite"
        >
          {LABELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {field("recipientName", "Recipient name", { required: true, placeholder: "Full name" })}
      {field("addressLine1", "Street address", { required: true, placeholder: "Street and number" })}
      {field("suburb", "Suburb / Area", { placeholder: "Suburb or area" })}
      {field("city", "City", { required: true, placeholder: "Your city" })}

      {/* Delivery instructions */}
      <div>
        <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-ink">
          Delivery instructions <span className="font-normal text-ink-mute">(optional)</span>
        </label>
        <textarea
          id="deliveryInstructions"
          value={form.deliveryInstructions ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, deliveryInstructions: e.target.value }))}
          placeholder="Green gate, ring bell. Call on arrival."
          rows={3}
          className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder-ink-mute outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
        />
      </div>

      {/* Default checkbox */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          onChange={set("isDefault")}
          className="h-4 w-4 cursor-pointer accent-malachite"
        />
        <span className="text-sm text-ink">Set as default delivery address</span>
      </label>

      {error && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer text-sm text-ink-mute transition-colors duration-200 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
