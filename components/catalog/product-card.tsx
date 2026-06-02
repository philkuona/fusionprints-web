import Link from "next/link";
import { type CatalogProduct, aspectRatioPct, formatPrice } from "@/lib/api/catalog";

interface ProductCardProps {
  product: CatalogProduct;
  featured?: boolean;
}

/** Visual placeholder that shows the actual print proportion */
function PrintProportionVisual({ product, featured }: { product: CatalogProduct; featured?: boolean }) {
  const pct = aspectRatioPct(product);
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-ink/5">
      <div style={{ paddingBottom: `${Math.min(pct, 130)}%` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {/* Scaled print representation */}
        <div
          className={`rounded border-2 ${featured ? "border-malachite/30 bg-malachite/5" : "border-ink/15 bg-white/60"}`}
          style={{
            width: "55%",
            aspectRatio: `${product.sizeCode.split("x")[0]} / ${product.sizeCode.split("x")[1]}`,
          }}
        />
        <p className="font-mono text-xs text-ink-mute">{product.labelInches}</p>
      </div>
    </div>
  );
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  return (
    <Link
      href={`/prints/${product.sizeCode}`}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-colors duration-200 hover:border-malachite/30 hover:shadow-sm ${
        featured ? "border-malachite/20 bg-malachite/3" : "border-ink/10 bg-white"
      }`}
    >
      <PrintProportionVisual product={product} featured={featured} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-ink">{product.labelInches}</p>
            <p className="text-sm text-ink-mute">{product.labelCm}</p>
          </div>
          <p className="font-mono text-sm font-medium text-ink">
            {formatPrice(product.unitPriceUsd)}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-xs capitalize text-ink-soft">
            {product.finish}
          </span>
          <span className="text-xs font-medium text-malachite opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
