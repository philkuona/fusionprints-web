import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProduct, formatPrice } from "@/lib/api/catalog";
import { Container } from "@/components/ui/container";

const WA = "https://wa.me/263781387466";

interface Props {
  params: Promise<{ size: string }>;
}

// What each size is best for. Warm, plain language, no jargon.
const PERFECT_FOR: Record<string, string[]> = {
  "4x6": ["Albums and photo wallets", "Sharing a stack with family", "The fridge door and the office desk"],
  "5x7": ["A frame on a shelf or desk", "A small, thoughtful gift", "Cards and keepsakes"],
  "6x6": ["Square shots from your phone", "A clustered gallery of little prints", "Modern, minimal framing"],
  "6x8": ["A touch bigger than a standard photo", "Framing without crowding a shelf", "Portraits and travel shots"],
  "8x10": ["The classic frame size", "Portraits and family photos", "The mantelpiece"],
  "11x14": ["A print that starts to make a statement", "Above a side table or in a hallway", "A favourite shot, given room to breathe"],
  "12x18": ["A proper feature on the wall", "Landscapes and group photos", "A focal point for a room"],
  "16x20": ["The centrepiece", "The first thing people notice walking in", "Your best photo, at its best"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { size } = await params;
  const product = await getProduct(size);
  if (!product) return {};
  return {
    title: `${product.labelInches} Print | FusionPrints`,
    description: `Order a ${product.displayLabel} print from FusionPrints, printed in-house and ready in 24 hours.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { size } = await params;
  const product = await getProduct(size);
  if (!product) notFound();

  const isWallArt = product.productType === "poster";
  // Dedicated per-size image (not reused from the homepage cards).
  const img = `/images/detail-${product.sizeCode}.jpg`;
  const perfectFor = PERFECT_FOR[product.sizeCode] ?? [];

  return (
    <Container className="py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink-mute">
        <Link
          href={isWallArt ? "/wall-art" : "/prints"}
          className="cursor-pointer transition-colors duration-200 hover:text-ink"
        >
          {isWallArt ? "Wall Art" : "Photo Prints"}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.labelInches}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Size-specific image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5 shadow-md">
          <Image
            src={img}
            alt={`A ${product.displayLabel} print from FusionPrints`}
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            priority
          />
        </div>

        {/* Product info */}
        <div className="flex flex-col justify-center">
          {isWallArt && (
            <span className="mb-3 inline-flex w-fit rounded-full bg-malachite/10 px-3 py-1 text-xs font-semibold text-malachite">
              Wall art
            </span>
          )}
          <h1 className="font-fraunces text-4xl font-bold text-ink">{product.labelInches}</h1>
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

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/editor/new?size=${product.sizeCode}`}
              className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Start printing
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-ink/20 px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
            >
              Order on WhatsApp
            </a>
          </div>

          {/* Perfect for */}
          {perfectFor.length > 0 && (
            <div className="mt-8 border-t border-ink/8 pt-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink-mute">Perfect for</h2>
              <ul className="mt-3 space-y-2">
                {perfectFor.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-malachite" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
