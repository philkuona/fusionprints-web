import type { Metadata } from "next";
import { CompositeEditorView } from "@/components/composite-editor/composite-editor-view";
import { COMPOSITE_PRODUCTS } from "@/lib/composite-products";

export const metadata: Metadata = {
  title: "Design your Wallet Prints | FusionPrints",
};

export default function Page() {
  return <CompositeEditorView product={COMPOSITE_PRODUCTS.wallet} />;
}
