import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, formatPrice } from "@/lib/api/catalog";
import { Container } from "@/components/ui/container";

interface Props {
  params: Promise<{ size: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { size } = await params;
  const product = await getProduct(size);
  if (!product) return {};
  return {
    title: `${product.labelInches} Print — FusionPrints`,
    description: `Order a ${product.displayLabel} print from FusionPrints. ${formatPrice(product.unitPriceUsd)} per print.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { size } = await params;
  const product = await getProduct(size);
  if (!product) notFound();

  const isWallArt = product.productType === "poster";
  const [w, h] = product.sizeCode.split("x").map(Number);

  return (
    <Container className="py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/prints" className="cursor-pointer transition-colors duration-200 hover:text-ink">
          Prints
        </Link>
        <span>/</span>
        <span className="text-ink">{product.labelInches}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Print proportion visual */}
        <div className="flex items-center justify-center rounded-2xl border border-ink/10 bg-ink/3 p-8">
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-lg border-2 shadow-md ${isWallArt ? "border-malachite/30 bg-malachite/5" : "border-ink/20 bg-white"}`}
              style={{
                width: isWallArt ? "80%" : "60%",
                maxWidth: 320,
                aspectRatio: `${w} / ${h}`,
              }}
            />
            <p className="font-mono text-sm text-ink-mute">
              {product.labelInches} · {product.labelCm}
            </p>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col justify-center">
          {isWallArt && (
            <span className="mb-3 inline-flex w-fit rounded-full bg-malachite/10 px-3 py-1 text-xs font-semibold text-malachite">
              Wall art
            </span>
          )}
          <h1 className="font-fraunces text-4xl font-bold text-ink">
            {product.labelInches}
          </h1>
          <p className="mt-1 text-ink-mute">{product.labelCm}</p>

          <p className="mt-6 font-mono text-3xl font-medium text-ink">
            {formatPrice(product.unitPriceUsd)}
            <span className="ml-2 font-mono text-base font-normal text-ink-mute">per print</span>
          </p>

          {/* Specs */}
          <dl className="mt-8 space-y-3">
            <div className="flex justify-between border-b border-ink/8 pb-3">
              <dt className="text-sm text-ink-mute">Finish</dt>
              <dd className="text-sm font-medium capitalize text-ink">{product.finish}</dd>
            </div>
            <div className="flex justify-between border-b border-ink/8 pb-3">
              <dt className="text-sm text-ink-mute">Min. resolution</dt>
              <dd className="font-mono text-sm text-ink">
                {product.minResolution.width} × {product.minResolution.height} px
              </dd>
            </div>
            <div className="flex justify-between pb-3">
              <dt className="text-sm text-ink-mute">Recommended</dt>
              <dd className="font-mono text-sm text-ink">
                {product.recommendedResolution.width} × {product.recommendedResolution.height} px
              </dd>
            </div>
          </dl>

          {/* CTA — upload coming in 2.1 */}
          <div className="mt-8">
            <button
              disabled
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-malachite/50 text-sm font-semibold text-ink/50 sm:w-auto sm:px-8"
            >
              Start printing
            </button>
            <p className="mt-2 text-xs text-ink-mute">
              Photo upload coming soon — order via{" "}
              <a
                href="https://wa.me/263781387466"
                className="cursor-pointer underline underline-offset-2"
              >
                WhatsApp
              </a>{" "}
              in the meantime.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
