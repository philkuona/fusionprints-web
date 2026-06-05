import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/api/catalog";
import { Container } from "@/components/ui/container";
import { FaqAccordion } from "@/components/catalog/faq-accordion";

export const metadata: Metadata = {
  title: "Wall Art | FusionPrints",
  description:
    "Large-format wall art up to 16×20, printed in-house on professional stock and checked by hand. Ready in 24 hours.",
};

const WA = "https://wa.me/263781387466";
const START = "/account/photos?size=11x14";

const WALL_BLURB: Record<string, string> = {
  "11x14": "Makes a statement above a side table or in a hallway.",
  "12x18": "A proper feature, sized to anchor a room.",
  "16x20": "The centrepiece. The first thing people notice.",
};

const BENEFITS = [
  { label: "Big, up to 16×20", icon: <path d="M4 4h7v2H6v5H4V4zm16 16h-7v-2h5v-5h2v7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
  { label: "Printed in-house", icon: <path d="M6 9V4h12v5M6 18h12v3H6v-3zM4 9h16a2 2 0 012 2v4H2v-4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
  { label: "Ready in 24 hours", icon: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></> },
  { label: "Easy to hang", icon: <path d="M12 3v6m0 0l-3-2m3 2l3-2M5 21h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
  { label: "Checked by hand", icon: <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> },
];

const FAQS = [
  {
    q: "What size should I choose?",
    a: "It depends on your wall and how close people stand. 11×14 suits a hallway or above a side table. 12×18 holds its own as a feature. 16×20 is the centrepiece, the first thing people notice when they walk in. When in doubt, go one size up.",
  },
  {
    q: "Will my photo look good that large?",
    a: "Big prints need more detail. We check the resolution of every image and, if it isn't sharp enough for the size you picked, we tell you before you pay so there are no surprises on the wall. Sending the original photo rather than a copy from social media makes a real difference.",
  },
  {
    q: "What finish works best for wall art?",
    a: "Lustre. Its soft, low-glare sheen means no harsh reflections from windows or lights, and it resists fingerprints when you hang it. That is why it is our default for large prints.",
  },
  {
    q: "How do I prepare my photo for a large print?",
    a: "Just send us the best version you have, ideally the original full-resolution file. Upload it here and we will guide you through cropping for your chosen size, or message it to us on WhatsApp and we will handle the rest.",
  },
  {
    q: "Do you frame the prints?",
    a: "Framing and mounting are on the way. For now we deliver the print itself, ready for the frame of your choice. Want a recommendation? Ask us on WhatsApp.",
  },
];

export default async function WallArtPage() {
  const catalog = await getCatalog();
  const sizes = catalog.filter((p) => p.productType === "poster");

  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-ink">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <h1 className="font-fraunces text-5xl font-bold leading-[1.05] text-cream sm:text-6xl">
              Your wall deserves this.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
              Large-format prints on professional stock, printed in-house and checked by hand.
              One image, given the room it deserves.
            </p>
            <div className="mt-8">
              <Link href={START} className="inline-flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream">
                Start with wall art
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/40 shadow-lg">
            <Image src="/images/wallart-hero.jpg" alt="A large framed photographic print on a warm, minimal living-room wall" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" priority />
          </div>
        </Container>
      </section>

      {/* 2. Key benefits bar */}
      <section className="border-b border-ink/8 bg-white py-6">
        <Container>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {BENEFITS.map((b) => (
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

      {/* 3. Pick your size */}
      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Pick your statement</h2>
          <p className="mt-2 text-ink-soft">Three sizes, each one built to be looked at.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sizes.map((p) => (
              <Link key={p.sizeCode} href={`/prints/${p.sizeCode}`} className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-colors duration-200 hover:border-ink/25">
                <div className="relative aspect-[4/3] bg-ink/5">
                  <Image src={`/images/wa-card-${p.sizeCode}.jpg`} alt={`A ${p.displayLabel} wall art print in a room`} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-fraunces text-2xl font-bold text-ink">{p.labelInches}</h3>
                  <p className="font-mono text-[11px] text-ink-mute">{p.labelCm}</p>
                  <p className="mt-2 text-sm text-ink-soft">{WALL_BLURB[p.sizeCode] ?? ""}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-malachite-deep transition-colors duration-200 group-hover:text-ink">
                    Print this size
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Quality callout + process */}
      <section className="bg-ink py-20">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-fraunces text-4xl font-bold leading-tight text-cream sm:text-5xl">
            One image. One wall.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/70">
            A great photo deserves more than a phone screen. We print it big, on professional stock,
            so the moment lives where you can actually see it every day.
          </p>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { img: "/images/wa-quality.jpg", alt: "Close-up of a large fine-art print showing rich detail", title: "Built to be looked at closely", body: "Professional paper, deep colour, and detail that holds up at arm's length. We check every large print by hand before it leaves us." },
              { img: "/images/wa-hang.jpg", alt: "A person levelling a large framed print on a wall", title: "Easy to live with", body: "Sized to standard frames and simple to hang. Choose delivery to your door or collect it in person, usually within 24 hours." },
            ].map((c) => (
              <div key={c.title} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <div className="relative aspect-[16/9] bg-ink/5">
                  <Image src={c.img} alt={c.alt} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-fraunces text-xl font-bold text-ink">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Finish guide */}
      <section className="border-y border-ink/8 bg-white py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Glossy or lustre?</h2>
          <p className="mt-2 max-w-xl text-ink-soft">For wall art we lean lustre, but here is how they compare.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {[
              { name: "Glossy", img: "/images/wa-finish-glossy.jpg", alt: "Close-up of a glossy large print catching the light", body: "Bright, punchy, and reflective. Colours pop and blacks look deep. Best where the light is soft or behind glass." },
              { name: "Lustre", img: "/images/wa-finish-lustre.jpg", alt: "Close-up of a lustre large print with a soft pearl sheen", body: "A soft, low-glare sheen that beats window reflections and resists fingerprints. Our default for wall art." },
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
      <section className="bg-cream py-12">
        <Container className="flex flex-col items-center gap-4 rounded-2xl border border-ink/10 bg-white p-6 text-center sm:flex-row sm:text-left">
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
              Ready-to-hang framing and mounting are on the way, so your wall art arrives finished.
              For now we deliver the print itself, ready for the frame of your choice.
            </p>
          </div>
        </Container>
      </section>

      {/* 6. FAQ */}
      <section className="bg-cream py-16">
        <Container className="max-w-3xl">
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Good questions</h2>
          <div className="mt-8">
            <FaqAccordion items={FAQS} />
          </div>
        </Container>
      </section>

      {/* 7. Trust block (in place of reviews) */}
      <section className="border-y border-ink/8 bg-white py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Why trust us with the big one</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              { t: "We print it ourselves", b: "No outsourcing. Your photo is printed and checked under our own roof, start to finish." },
              { t: "Checked by hand", b: "Every large print is reviewed before it leaves us. We flag a low-res file before you pay, never after." },
              { t: "We make it right", b: "If a print is not right when it reaches you, tell us and we will sort it out." },
            ].map((c) => (
              <div key={c.t}>
                <span className="block h-1 w-10 rounded-full bg-malachite" />
                <h3 className="mt-4 font-fraunces text-lg font-bold text-ink">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. Cross-sell */}
      <section className="bg-cream py-12">
        <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-lg text-ink-soft">Want something for the album or the desk?</p>
          <Link href="/prints" className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-malachite-deep transition-colors duration-200 hover:text-ink">
            Explore Photo Prints
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Container>
      </section>

      {/* 9. Bottom CTA */}
      <section className="bg-ink py-16">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-fraunces text-4xl font-bold leading-tight text-cream sm:text-5xl">
            Ready to print?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={START} className="flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream">
              Start with wall art
            </Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="flex h-12 cursor-pointer items-center rounded-full border border-cream/30 px-8 text-sm font-semibold text-cream transition-colors duration-200 hover:border-cream hover:bg-cream/10">
              Order on WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
