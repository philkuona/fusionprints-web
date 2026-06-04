import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { HeroCarousel } from "@/components/home/hero-carousel";

export const metadata: Metadata = {
  title: "FusionPrints — Hold the moment.",
  description:
    "Premium photo prints and wall art, printed in-house. Order on WhatsApp or design it yourself on the web.",
  openGraph: {
    title: "FusionPrints — Hold the moment.",
    description: "Premium photo prints and wall art, printed in-house.",
  },
};

const WA = "https://wa.me/263781387466";

/* ── Icons ─────────────────────────────────────────────────────────── */

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
    >
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Collection data ───────────────────────────────────────────────── */

type Card = {
  size: string;
  dims: string;
  img: string;
  alt: string;
  href: string;
};

const PHOTO_PRINTS: Card[] = [
  {
    size: "4 × 6",
    dims: "10 × 15 cm",
    img: "/images/card-prints-4x6.jpg",
    alt: "A young couple at a sunlit kitchen counter looking through a stack of freshly printed 4 by 6 photographs",
    href: "/prints/4x6",
  },
  {
    size: "5 × 7",
    dims: "13 × 18 cm",
    img: "/images/card-prints-5x7.jpg",
    alt: "An older man in an armchair by a window holding a single 5 by 7 print, lost in a memory",
    href: "/prints/5x7",
  },
  {
    size: "6 × 6",
    dims: "15 × 15 cm",
    img: "/images/card-prints-6x6.jpg",
    alt: "Two children lying on a bedroom floor arranging square 6 by 6 prints into a grid",
    href: "/prints/6x6",
  },
  {
    size: "8 × 10",
    dims: "20 × 25 cm",
    img: "/images/card-prints-8x10.jpg",
    alt: "A mother in a sunlit garden holding up an 8 by 10 print for her baby to see",
    href: "/prints/8x10",
  },
];

const WALL_ART: Card[] = [
  {
    size: "11 × 14",
    dims: "28 × 36 cm",
    img: "/images/card-wall-11x14.jpg",
    alt: "Two friends admiring a framed 11 by 14 print hanging on a bright minimal wall",
    href: "/prints/11x14",
  },
  {
    size: "12 × 18",
    dims: "30 × 45 cm",
    img: "/images/card-wall-12x18.jpg",
    alt: "A teenager in a sunlit bedroom proudly holding up a 12 by 18 poster print to hang",
    href: "/prints/12x18",
  },
  {
    size: "16 × 20",
    dims: "40 × 50 cm",
    img: "/images/card-wall-16x20.jpg",
    alt: "A family hanging a large 16 by 20 framed print together in a warm living room",
    href: "/prints/16x20",
  },
  {
    size: "Finish guide",
    dims: "Glossy & lustre",
    img: "/images/card-finish-guide.jpg",
    alt: "Two prints of the same landscape side by side, one glossy and one lustre, showing the difference in finish",
    href: "/prints#wall-art",
  },
];

/* ── Collection card ───────────────────────────────────────────────── */

function CollectionCard({ c, ring = false }: { c: Card; ring?: boolean }) {
  return (
    <Link href={c.href} className="group block cursor-pointer">
      <div
        className={`relative aspect-4/5 overflow-hidden rounded-2xl bg-ink/5 shadow-sm transition-shadow duration-200 group-hover:shadow-lg ${
          ring ? "ring-1 ring-ink/10" : ""
        }`}
      >
        <Image
          src={c.img}
          alt={c.alt}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-fraunces text-xl font-bold text-ink">{c.size}</h3>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
          {c.dims}
        </span>
      </div>
      <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-malachite-deep transition-colors duration-200 group-hover:text-ink">
        View
        <ArrowIcon />
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ── Hero — brand card (25%) + themed slideshow (75%). Full-bleed on
          mobile/tablet; contained to the content width on desktop. ─────── */}
      <section className="bg-cream lg:py-8">
        <div className="lg:mx-auto lg:max-w-6xl lg:px-8">
          <div className="grid grid-cols-1 overflow-hidden bg-ink lg:grid-cols-[1fr_3fr] lg:rounded-2xl">
            {/* Left: brand text card */}
            <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-8 sm:py-16 lg:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-malachite">
                Premium photo printing
              </p>
              <h1 className="mt-4 font-fraunces text-4xl font-bold leading-[0.95] tracking-tight text-malachite sm:text-6xl lg:text-4xl xl:text-5xl">
                Hold the moment.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg lg:text-sm">
                Prints and wall art made from the photos you love — printed in-house,
                checked by hand, on paper worth keeping.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 lg:flex-col">
                <Link
                  href="/prints"
                  className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream lg:w-full"
                >
                  Start an order
                </Link>
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-cream/30 px-8 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10 lg:w-full"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>

            {/* Right: auto-rotating themed slideshow */}
            <div className="relative min-h-[280px] min-w-0 sm:min-h-[360px] lg:min-h-[420px]">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Prints collection ──────────────────────────────────── */}
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-malachite-deep">
              Photo prints
            </p>
            <h2 className="mt-4 font-fraunces text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Everyday moments, printed to last.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Classic sizes on premium photo paper, colour-corrected by hand
              before they ever reach the printer.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
            {PHOTO_PRINTS.map((c) => (
              <CollectionCard key={c.size} c={c} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Wall Art collection — heavier, more premium ──────────────── */}
      <section className="border-y border-ink/8 bg-white py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-malachite-deep">
                Wall art
              </p>
              <h2 className="mt-4 font-fraunces text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Big enough to fill a wall.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Large-format statement pieces on professional stock — the kind of
                print most labs won&rsquo;t touch.
              </p>
            </div>
            <Link
              href="/prints#wall-art"
              className="group hidden cursor-pointer items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-malachite-deep sm:flex"
            >
              See all sizes
              <ArrowIcon />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
            {WALL_ART.map((c) => (
              <CollectionCard key={c.size} c={c} ring />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Promise strip — typography, no images ────────────────────── */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-2xl bg-ink/8 sm:grid-cols-3">
            {[
              {
                title: "Printed in-house",
                body: "Every order is printed on our own equipment — no outsourcing, no middlemen.",
              },
              {
                title: "Colour corrected by hand",
                body: "Our team reviews every image before it prints, so your colours come out right.",
              },
              {
                title: "Ready in 24 hours",
                body: "Most orders are ready the next day, for collection or delivery to your door.",
              },
            ].map((p) => (
              <div key={p.title} className="bg-cream p-8">
                <span className="block h-1 w-10 rounded-full bg-malachite" />
                <h3 className="mt-5 font-fraunces text-xl font-bold text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA — typography only, dark Ink ───────────────────── */}
      <section className="bg-ink py-24 sm:py-32">
        <Container className="text-center">
          <h2 className="mx-auto max-w-3xl font-fraunces text-4xl font-bold leading-tight text-cream sm:text-6xl">
            Don&rsquo;t let them fade on your phone.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-cream/70">
            Every photo worth taking is worth holding. Start with one — we&rsquo;ll
            take care of the rest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/prints"
              className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Browse prints
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 cursor-pointer items-center rounded-full border border-cream/30 px-8 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10"
            >
              Message us on WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
