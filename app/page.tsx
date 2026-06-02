import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "FusionPrints — Hold the moment.",
  description:
    "Premium photo prints, wall art, photo books and cards — printed in-house. Order on WhatsApp or design it yourself on the web.",
  openGraph: {
    title: "FusionPrints — Hold the moment.",
    description: "Premium photo prints, wall art, photo books and cards — printed in-house.",
  },
};

const WA = "https://wa.me/263781387466";

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-malachite">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Data ──────────────────────────────────────────────────────────── */

type Product = {
  title: string;
  img: string;
  alt: string;
  href: string;
  soon?: boolean;
};

const PRODUCTS: Product[] = [
  { title: "Photo prints", img: "/images/v2/print-1.jpg", alt: "A hand holding a printed photo", href: "/prints" },
  { title: "Wall art", img: "/images/v2/wall-feature.jpg", alt: "A person holding a large canvas print", href: "/prints#wall-art" },
  { title: "Photo books", img: "/images/v2/book-1.jpg", alt: "An open photo book", href: "/prints", soon: true },
  { title: "Albums", img: "/images/v2/book-3.jpg", alt: "A leather keepsake album in hand", href: "/prints", soon: true },
  { title: "Photo cards", img: "/images/v2/card-1.jpg", alt: "A printed greeting card in hand", href: "/prints", soon: true },
  { title: "Wallet prints", img: "/images/v2/print-2.jpg", alt: "A hand fanning small wallet prints", href: "/prints" },
];

const OCCASIONS: Product[] = [
  { title: "Weddings", img: "/images/v2/occ-wedding.jpg", alt: "An open wedding photo book", href: "/prints" },
  { title: "Graduations", img: "/images/v2/occ-graduation.jpg", alt: "A graduate holding a bouquet", href: "/prints" },
  { title: "New baby", img: "/images/v2/occ-baby.jpg", alt: "A hand holding a printed baby photo", href: "/prints" },
  { title: "Family", img: "/images/v2/occ-family.jpg", alt: "A hand holding a family photo", href: "/prints" },
  { title: "Everyday", img: "/images/v2/occ-everyday.jpg", alt: "Hands holding everyday prints", href: "/prints" },
  { title: "Celebrations", img: "/images/v2/occ-celebrate.jpg", alt: "A celebration captured in a print", href: "/prints" },
];

type BestSeller = { title: string; img: string; alt: string; tag?: string };

const BESTSELLERS: BestSeller[] = [
  { title: "4×6 prints", img: "/images/v2/print-1.jpg", alt: "Classic 4x6 photo print", tag: "Most loved" },
  { title: "16×20 wall art", img: "/images/v2/wall-feature.jpg", alt: "Large 16x20 wall art print" },
  { title: "5×7 prints", img: "/images/v2/print-3.jpg", alt: "5x7 photo print" },
  { title: "Wallet prints", img: "/images/v2/print-2.jpg", alt: "Set of wallet prints" },
];

/* ── Reusable category tile ────────────────────────────────────────── */

function CategoryTile({ p, aspect = "aspect-square" }: { p: Product; aspect?: string }) {
  return (
    <Link
      href={p.href}
      className={`group relative isolate flex ${aspect} flex-col justify-end overflow-hidden rounded-2xl bg-ink/5 shadow-sm transition-shadow duration-200 hover:shadow-lg`}
    >
      <Image
        src={p.img}
        alt={p.alt}
        fill
        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
        className="-z-10 object-cover photo-warm transition-transform duration-300 group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
      {p.soon && (
        <span className="absolute right-3 top-3 rounded-full bg-amber/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink">
          Soon
        </span>
      )}
      <div className="p-4">
        <h3 className="font-fraunces text-lg font-bold text-cream">{p.title}</h3>
        <span className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-malachite">
          Shop
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ── Promo hero ───────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden">
        <Image
          src="/images/v2/hero.jpg"
          alt="Hands holding a fan of freshly printed photographs"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover photo-warm"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
        <Container className="py-28">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full bg-malachite px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-ink">
              Printed in-house · ready in 24h
            </span>
            <h1 className="mt-5 font-fraunces text-6xl font-bold leading-[0.95] text-cream sm:text-7xl lg:text-8xl">
              Hold the moment.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/80">
              Premium prints, wall art, books, and cards — made from the photos
              you love, on paper worth keeping.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/prints"
                className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-7 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Start an order
              </Link>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 cursor-pointer items-center rounded-full border border-cream/40 px-7 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Trust strip (FP-honest: capabilities, not press) ─────────── */}
      <section className="border-b border-ink/8 bg-ink">
        <Container>
          <ul className="grid grid-cols-2 divide-ink/15 py-6 text-center sm:grid-cols-4 sm:divide-x">
            {[
              "Printed in-house",
              "Free colour correction",
              "Ready in 24 hours",
              "Collection or delivery",
            ].map((t) => (
              <li key={t} className="px-3 py-2 font-mono text-xs uppercase tracking-widest text-cream/70">
                {t}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Shop by product (dense grid) ─────────────────────────────── */}
      <section className="bg-cream py-18 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
                Shop by product
              </p>
              <h2 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
                Everything we print.
              </h2>
            </div>
            <Link
              href="/prints"
              className="group hidden cursor-pointer items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-malachite-deep sm:flex"
            >
              See all products
              <ArrowIcon />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PRODUCTS.map((p) => (
              <CategoryTile key={p.title} p={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Wall art moat (feature) ──────────────────────────────────── */}
      <section className="border-y border-ink/8 bg-white py-18 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-ink/5 shadow-lg lg:order-1">
              <Image
                src="/images/v2/wall-feature.jpg"
                alt="A person holding a large canvas print of a seascape"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover photo-warm"
              />
            </div>
            <div className="lg:order-2">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
                Wall art · only at FusionPrints
              </p>
              <h2 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
                Big enough to fill a wall.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Large-format canvas and posters up to 16×20 in — printed in-house
                on professional inkjet. The statement piece most labs won&rsquo;t
                touch.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "11×14 in (28×36 cm) — USD 10.00",
                  "12×18 in (30×45 cm) — USD 14.00",
                  "16×20 in (40×50 cm) — USD 22.00",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="font-mono text-sm text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/prints#wall-art"
                className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-ink-soft"
              >
                View wall art sizes
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Shop by occasion ─────────────────────────────────────────── */}
      <section className="bg-cream py-18 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
                Shop by occasion
              </p>
              <h2 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
                For whatever you&rsquo;re celebrating.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {OCCASIONS.map((o) => (
              <CategoryTile key={o.title} p={o} aspect="aspect-4/5" />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Bestsellers row (hand-picked) ────────────────────────────── */}
      <section className="border-y border-ink/8 bg-white py-18 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
                Popular right now
              </p>
              <h2 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
                Crowd favourites.
              </h2>
            </div>
            <Link
              href="/prints"
              className="group hidden cursor-pointer items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-malachite-deep sm:flex"
            >
              Shop all sizes
              <ArrowIcon />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {BESTSELLERS.map((b) => (
              <Link
                key={b.title}
                href="/prints"
                className="group cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink/5 shadow-sm transition-shadow duration-200 group-hover:shadow-lg">
                  <Image
                    src={b.img}
                    alt={b.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover photo-warm transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                  {b.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream">
                      {b.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <h3 className="font-semibold text-ink">{b.title}</h3>
                  <ArrowIcon />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Value props ──────────────────────────────────────────────── */}
      <section className="bg-cream py-16">
        <Container>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { title: "Printed in-house", body: "Every order is printed at our own lab. No outsourcing, no middlemen." },
              { title: "Colour corrected", body: "Our team reviews every image before it prints. Your colours come out right." },
              { title: "Quick turnaround", body: "Most orders are ready within 24 hours, for collection or delivery." },
            ].map((item) => (
              <div key={item.title} className="border-t-2 border-malachite pt-5">
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-t border-ink/8 bg-cream py-18 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
              How it works
            </p>
            <h2 className="mt-3 font-fraunces text-4xl font-bold text-ink sm:text-5xl">
              Simple from start to finish.
            </h2>
            <p className="mt-3 text-lg text-ink-soft">Two ways to order. Both take minutes.</p>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              { step: "01", title: "Send or upload", body: "Send your photo on WhatsApp or upload it on our website — straight from your camera roll." },
              { step: "02", title: "Choose your size", body: "Pick your product and size. We'll flag it if the resolution isn't high enough before you commit." },
              { step: "03", title: "We print and deliver", body: "Printed in-house and ready for collection or delivery — usually within 24 hours." },
            ].map((item) => (
              <div key={item.step}>
                <p className="font-mono text-3xl font-medium text-malachite-deep">{item.step}</p>
                <h3 className="mt-3 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/how-it-works"
              className="group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-malachite-deep"
            >
              See the full process
              <ArrowIcon />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="bg-ink py-20 sm:py-24">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-fraunces text-4xl font-bold text-cream sm:text-5xl">
            Don&rsquo;t let them fade on your phone.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-cream/70">
            Every photo you&rsquo;ve taken deserves to be held, framed, and remembered.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/prints"
              className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-7 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Browse prints
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 cursor-pointer items-center rounded-full border border-cream/40 px-7 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10"
            >
              Message us on WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
