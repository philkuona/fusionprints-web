import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/api/catalog";
import { Container } from "@/components/ui/container";
import { FaqAccordion } from "@/components/catalog/faq-accordion";

export const metadata: Metadata = {
  title: "Photo Prints | FusionPrints",
  description:
    "Premium photo prints in classic sizes, printed in-house and checked by hand. Ready in 24 hours.",
};

const WA = "https://wa.me/263781387466";
const START = "/editor/new?size=4x6";

const SIZE_BLURB: Record<string, string> = {
  "4x6": "The everyday classic.",
  "5x7": "A step up, frame-ready.",
  "6x6": "Square and modern.",
  "6x8": "A little more presence.",
  "8x10": "The portrait standard.",
};

// Locked promise copy (WEB-SESSION-BRIEFING.md) — used verbatim.
const PROMISES = [
  {
    title: "We print it ourselves. Every single one.",
    body: `No outsourcing. No "sent to a lab somewhere." Your photos stay with us from upload to handoff, which means if something's off, we catch it before you do.`,
    img: "/images/why-printed.jpg",
    alt: "Hands holding a stack of freshly printed photographs",
  },
  {
    title: "Blink and it's ready.",
    body: `24 hours. Sometimes less. We're not waiting on anyone because we're doing it all ourselves. Your wall won't stay empty for long.`,
    img: "/images/why-fast.jpg",
    alt: "A person opening a freshly delivered envelope of prints at their door",
  },
  {
    title: "Ordering a print shouldn't feel like filing taxes.",
    body: `Two minutes on WhatsApp. A few taps on the web. That's it. We built the simplest checkout in the room because life's too short for complicated.`,
    img: "/images/why-easy.jpg",
    alt: "A relaxed person ordering prints from their phone at home",
  },
];

const FAQS = [
  {
    q: "Will my phone photo print well?",
    a: "Most modern phone photos print beautifully up to 8×10. We check every image before printing, and if a photo is too small for the size you picked, we tell you before you pay, not after. For the best result, send the original photo rather than a screenshot or a copy saved from social media.",
  },
  {
    q: "What's the difference between glossy and lustre?",
    a: "Glossy is bright and punchy, with rich colour and a shiny surface that makes photos pop. Lustre has a soft, low-glare finish that resists fingerprints and looks great in any light. If you're unsure, lustre is the safe, forgiving choice.",
  },
  {
    q: "How do I send you my photo?",
    a: "Two ways. Upload it here on the web and we'll guide you through cropping and ordering, or message it to us on WhatsApp and we'll take it from there.",
  },
  {
    q: "How long does it take?",
    a: "Most orders are ready within 24 hours, sometimes less, because we print everything ourselves. Choose delivery to your door or collect in person.",
  },
  {
    q: "What if I'm not happy with my print?",
    a: "Tell us. We check every print by hand before it leaves us, but if something isn't right, we'll make it right.",
  },
];

export default async function PhotoPrintsPage() {
  const catalog = await getCatalog();
  const sizes = catalog.filter((p) => p.productType === "photo_print");

  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-cream">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <h1 className="font-fraunces text-5xl font-bold leading-[1.05] text-ink sm:text-6xl">
              Photo Prints
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              The photos you love, off your phone and into your hands. Printed in-house,
              checked by hand, ready in a day.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={START}
                className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Start printing
              </Link>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 cursor-pointer items-center rounded-full border border-ink/20 px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5 shadow-md">
            <Image src="/images/prints-hero.jpg" alt="A family laughing over freshly printed photos at home" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" priority />
          </div>
        </Container>
      </section>

      {/* 2. Key benefits bar */}
      <section className="border-y border-ink/8 bg-white py-6">
        <Container>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Printed in-house", icon: <path d="M6 9V4h12v5M6 18h12v3H6v-3zM4 9h16a2 2 0 012 2v4H2v-4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
              { label: "Ready in 24 hours", icon: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></> },
              { label: "Colour corrected by hand", icon: <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
              { label: "Free collection", icon: <path d="M3 7h13l1 5h4v4h-2a2 2 0 11-4 0H9a2 2 0 11-4 0H3V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
            ].map((b) => (
              <li key={b.label} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <span className="shrink-0 text-malachite">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">{b.icon}</svg>
                </span>
                {b.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Size grid */}
      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Choose your size</h2>
          <p className="mt-2 text-ink-soft">Classic sizes for albums, frames, and everyday memories.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {sizes.map((p) => (
              <Link
                key={p.sizeCode}
                href={`/prints/${p.sizeCode}`}
                className="group flex cursor-pointer flex-col rounded-2xl border border-ink/10 bg-white p-4 transition-colors duration-200 hover:border-ink/25"
              >
                <div className="flex h-32 items-center justify-center">
                  <div
                    className="rounded border-2 border-ink/20 bg-cream shadow-sm"
                    style={{ aspectRatio: p.sizeCode.replace("x", " / "), maxHeight: "100%", maxWidth: "100%", height: "100%" }}
                  />
                </div>
                <p className="mt-4 font-fraunces text-lg font-bold text-ink">{p.labelInches}</p>
                <p className="font-mono text-[11px] text-ink-mute">{p.labelCm}</p>
                <p className="mt-2 flex-1 text-sm text-ink-soft">{SIZE_BLURB[p.sizeCode] ?? ""}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-malachite-deep transition-colors duration-200 group-hover:text-ink">
                  Print this size
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Why FusionPrints */}
      <section className="border-y border-ink/8 bg-white py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Why FusionPrints</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5 shadow-sm">
                  <Image src={p.img} alt={p.alt} fill sizes="(max-width: 1024px) 100vw, 360px" className="object-cover" />
                </div>
                <h3 className="mt-5 font-fraunces text-xl font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Finish guide */}
      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Glossy or lustre?</h2>
          <p className="mt-2 max-w-xl text-ink-soft">Both look great. It comes down to how you like your photos to feel.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {[
              { name: "Glossy", img: "/images/finish-glossy.jpg", alt: "Close-up of a glossy print catching the light", body: "Bright, punchy, and reflective. Colours pop and blacks look deep. Best for vivid shots you'll keep behind glass or in an album." },
              { name: "Lustre", img: "/images/finish-lustre.jpg", alt: "Close-up of a lustre print with a soft pearl sheen", body: "A soft, low-glare sheen that resists fingerprints and looks good in any light. The easy, forgiving choice, and our default for most prints." },
            ].map((f) => (
              <div key={f.name} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <div className="relative aspect-[16/9] bg-ink/5">
                  <Image src={f.img} alt={f.alt} fill sizes="(max-width: 640px) 100vw, 560px" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-fraunces text-xl font-bold text-ink">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Framing teaser */}
      <section className="border-t border-ink/8 bg-ink/[0.03] py-12">
        <Container className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-malachite/15 text-malachite-deep">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
              <rect x="8" y="8" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
          <div className="flex-1">
            <span className="inline-flex rounded-full bg-malachite/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-malachite-deep">
              Coming soon
            </span>
            <h2 className="mt-2 font-fraunces text-2xl font-bold text-ink">Framing &amp; mounting</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">
              Soon you will be able to add ready-to-hang framing and mounting, so your print arrives
              finished. For now we deliver the print itself, ready for the frame of your choice.
            </p>
          </div>
        </Container>
      </section>

      {/* 6. FAQ */}
      <section className="border-y border-ink/8 bg-white py-16">
        <Container className="max-w-3xl">
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Good questions</h2>
          <div className="mt-8">
            <FaqAccordion items={FAQS} />
          </div>
        </Container>
      </section>

      {/* 7. Cross-sell to Wall Art */}
      <section className="bg-cream py-12">
        <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-lg text-ink-soft">Got a photo that deserves a wall?</p>
          <Link href="/wall-art" className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-malachite-deep transition-colors duration-200 hover:text-ink">
            Explore Wall Art
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Container>
      </section>

      {/* 8. Bottom CTA */}
      <section className="bg-ink py-16">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-fraunces text-4xl font-bold leading-tight text-cream sm:text-5xl">
            Ready to print?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={START}
              className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Start printing
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 cursor-pointer items-center rounded-full border border-cream/30 px-8 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10"
            >
              Order on WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
