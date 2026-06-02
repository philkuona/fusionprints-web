"use client";

import { useEffect, useState, use } from "react";
import { getAddresses, updateAddress, type Address } from "@/lib/api/addresses";
import { AddressForm } from "@/components/account/address-form";

export default function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    getAddresses().then((list) => setAddress(list.find((a) => a.id === id) ?? null));
  }, [id]);

  if (!address) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-bold text-ink">Edit address</h1>
      <div className="mt-6">
        <AddressForm
          initial={{
            ...address,
            suburb: address.suburb ?? undefined,
            deliveryInstructions: address.deliveryInstructions ?? undefined,
          }}
          onSubmit={(data) => updateAddress(id, data)}
          submitLabel="Update address"
        />
      </div>
    </div>
  );
}
