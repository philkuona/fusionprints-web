import type { Metadata } from "next";
import { CompositeProductView } from "@/components/composite-editor/composite-product-view";
import { COMPOSITE_PRODUCTS } from "@/lib/composite-products";

export const metadata: Metadata = {
  title: "Mini Prints | FusionPrints",
  description: "Two mini prints side by side on one sheet — design and order online.",
};

export default function Page() {
  return <CompositeProductView product={COMPOSITE_PRODUCTS.mini} />;
}
