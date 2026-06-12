"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAddresses, deleteAddress, setDefaultAddress, type Address } from "@/lib/api/addresses";

function AddressCard({
  address,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Remove this address?")) return;
    setError(null);
    setDeleting(true);
    try {
      await deleteAddress(address.id);
      onDelete(address.id);
    } catch {
      // Keep the card — pretending it's gone would resurrect it on reload.
      setDeleting(false);
      setError("Couldn't remove this address. Please try again.");
    }
  };

  const handleSetDefault = async () => {
    setError(null);
    setSettingDefault(true);
    try {
      await setDefaultAddress(address.id);
      onSetDefault(address.id);
    } catch {
      setError("Couldn't set this address as default. Please try again.");
    } finally {
      setSettingDefault(false);
    }
  };

  return (
    <div className={`relative rounded-2xl border p-5 transition-colors duration-200 ${address.isDefault ? "border-malachite bg-malachite/5" : "border-ink/10 bg-white"}`}>
      {address.isDefault && (
        <span className="absolute right-4 top-4 rounded-full bg-malachite px-2.5 py-0.5 text-xs font-semibold text-ink">
          Default
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-mute">{address.label}</p>
      <p className="mt-1.5 font-medium text-ink">{address.recipientName}</p>
      <p className="mt-0.5 text-sm text-ink-soft">{address.addressLine1}</p>
      {address.suburb && <p className="text-sm text-ink-soft">{address.suburb}</p>}
      <p className="text-sm text-ink-soft">{address.city}</p>
      {address.deliveryInstructions && (
        <p className="mt-2 text-xs italic text-ink-mute">{address.deliveryInstructions}</p>
      )}
      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/account/addresses/${address.id}/edit`}
          className="cursor-pointer text-xs font-medium text-ink-soft underline-offset-2 transition-colors duration-200 hover:text-ink hover:underline"
        >
          Edit
        </Link>
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={settingDefault}
            className="cursor-pointer text-xs font-medium text-ink-soft underline-offset-2 transition-colors duration-200 hover:text-ink hover:underline disabled:opacity-50"
          >
            {settingDefault ? "Setting…" : "Set as default"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="cursor-pointer text-xs font-medium text-coral underline-offset-2 transition-colors duration-200 hover:underline disabled:opacity-50"
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-coral">{error}</p>}
    </div>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      // If we removed the default and there are remaining, promote first
      const hadDefault = prev.find((a) => a.id === id)?.isDefault;
      if (hadDefault && remaining.length > 0) {
        return remaining.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      return remaining;
    });
  }, []);

  const handleSetDefault = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-fraunces text-2xl font-bold text-ink">Addresses</h1>
        <Link
          href="/account/addresses/new"
          className="flex h-10 cursor-pointer items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          Add address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <p className="text-ink-soft">No addresses yet.</p>
          <Link
            href="/account/addresses/new"
            className="mt-4 inline-flex cursor-pointer text-sm font-medium text-malachite underline-offset-2 hover:underline"
          >
            Add your first address
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
