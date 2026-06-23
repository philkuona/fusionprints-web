import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { CompositeProduct } from "@/lib/composite-products";

const WA = "https://wa.me/263781387466";

/**
 * Composite product page — mirrors the photo-print product page: hero, details,
 * and a "Start designing" CTA into the dedicated editor route (the editor is no
 * longer inline). Public; the editor route is auth-gated.
 */
export function CompositeProductView({ product }: { product: CompositeProduct }) {
  const cellCount = product.layout.cells.length;
  const cell = product.layout.cells[0];
  const whatYouGet = `${cellCount} prints (${cell.width}×${cell.height} in each) on one 4×6 sheet`;

  return (
    <Container className="py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/prints" className="cursor-pointer transition-colors duration-200 hover:text-ink">
          Photo Prints
        </Link>
        <span>/</span>
        <span className="text-ink">{product.displayName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Hero */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5 shadow-md">
          <Image
            src={`/images/composite-${product.slug}.jpg`}
            alt={`${product.displayName}: ${product.tagline}`}
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="font-fraunces text-4xl font-bold text-ink">{product.displayName}</h1>
          <p className="mt-2 font-fraunces text-lg italic text-malachite">{product.tagline}</p>

          <p className="mt-6 font-mono text-3xl font-medium text-ink">
            ${product.priceUsd.toFixed(2)}
            <span className="ml-2 font-mono text-base font-normal text-ink-mute">per sheet</span>
          </p>

          <p className="mt-6 text-ink-soft">{product.description}</p>

          <dl className="mt-8 space-y-3">
            <div className="flex justify-between border-b border-ink/8 pb-3">
              <dt className="text-sm text-ink-mute">What you get</dt>
              <dd className="text-right text-sm font-medium text-ink">{whatYouGet}</dd>
            </div>
            <div className="flex justify-between pb-3">
              <dt className="text-sm text-ink-mute">Finish</dt>
              <dd className="text-sm font-medium text-ink">Glossy · faint cut guides included</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/editor/new?size=${product.sizeCode}`}
              className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Start designing
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
        </div>
      </div>
    </Container>
  );
}
