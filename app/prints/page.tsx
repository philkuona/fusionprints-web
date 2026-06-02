import type { Metadata } from "next";
import { getCatalog } from "@/lib/api/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Prints — FusionPrints",
  description: "Premium photo prints in 8 sizes. From everyday snapshots to statement wall art.",
};

export default async function PrintsPage() {
  const catalog = await getCatalog();
  const photoProducts = catalog.filter((p) => p.productType === "photo_print");
  const wallArtProducts = catalog.filter((p) => p.productType === "poster");

  return (
    <div>
      {/* Wall art hero — the moat */}
      <div className="border-b border-ink/8 bg-ink py-14">
        <Container>
          <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
            Only available at FusionPrints
          </p>
          <h2 className="mt-3 font-fraunces text-4xl font-bold text-cream sm:text-5xl">
            Wall art that fills the room.
          </h2>
          <p className="mt-4 max-w-xl text-cream/70">
            Large-format prints up to 16×20 in — printed in-house on professional inkjet.
            The kind of statement piece most labs won&rsquo;t touch.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {wallArtProducts.map((product) => (
              <ProductCard key={product.sizeCode} product={product} featured />
            ))}
          </div>
        </Container>
      </div>

      {/* Standard photo prints */}
      <Container className="py-14">
        <h2 className="font-fraunces text-3xl font-bold text-ink">Photo prints</h2>
        <p className="mt-2 text-ink-soft">
          Classic sizes for albums, frames, and everyday memories.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {photoProducts.map((product) => (
            <ProductCard key={product.sizeCode} product={product} />
          ))}
        </div>

        {/* Size guide note */}
        <p className="mt-8 text-sm text-ink-mute">
          All prints include free colour correction. Lustre finish adds protection against fingerprints and UV.
        </p>
      </Container>
    </div>
  );
}
