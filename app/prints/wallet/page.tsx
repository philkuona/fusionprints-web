import type { Metadata } from "next";
import { CompositeProductView } from "@/components/composite-editor/composite-product-view";
import { COMPOSITE_PRODUCTS } from "@/lib/composite-products";

export const metadata: Metadata = {
  title: "Wallet Prints | FusionPrints",
  description: "Four 2×3 wallet prints on one 4×6 sheet — design and order online.",
};

export default function Page() {
  return <CompositeProductView product={COMPOSITE_PRODUCTS.wallet} />;
}
