"use client";

import { createAddress } from "@/lib/api/addresses";
import { AddressForm } from "@/components/account/address-form";

export default function NewAddressPage() {
  return (
    <div>
      <h1 className="font-fraunces text-2xl font-bold text-ink">Add address</h1>
      <div className="mt-6">
        <AddressForm onSubmit={createAddress} submitLabel="Add address" />
      </div>
    </div>
  );
}
