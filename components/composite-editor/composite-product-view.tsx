import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { CompositeProduct } from "@/lib/composite-products";
import { CompositeEditor } from "./composite-editor";

/** Product page for a composite product: header + the composite editor. */
export function CompositeProductView({ product }: { product: CompositeProduct }) {
  return (
    <Container className="py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/prints" className="cursor-pointer transition-colors duration-200 hover:text-ink">
          Photo Prints
        </Link>
        <span>/</span>
        <span className="text-ink">{product.displayName}</span>
      </nav>

      <div className="mb-8 max-w-2xl">
        <h1 className="font-fraunces text-4xl font-bold text-ink">{product.displayName}</h1>
        <p className="mt-2 font-fraunces text-lg italic text-malachite">{product.tagline}</p>
        <p className="mt-4 text-ink-soft">{product.description}</p>
        <p className="mt-4 font-mono text-2xl font-medium text-ink">
          ${product.priceUsd.toFixed(2)}
          <span className="ml-2 font-mono text-sm font-normal text-ink-mute">per sheet</span>
        </p>
      </div>

      <CompositeEditor product={product} />
    </Container>
  );
}
