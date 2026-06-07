import type { Metadata } from "next";
import { CompositeProductView } from "@/components/composite-editor/composite-product-view";
import { COMPOSITE_PRODUCTS } from "@/lib/composite-products";

export const metadata: Metadata = {
  title: "Passport Photos | FusionPrints",
  description: "Six 2×2 passport photos on one sheet — upload once, we lay them out.",
};

export default function Page() {
  return <CompositeProductView product={COMPOSITE_PRODUCTS.passport} />;
}
