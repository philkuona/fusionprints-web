import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/api/catalog";
import { Container } from "@/components/ui/container";
import { FaqAccordion } from "@/components/catalog/faq-accordion";

export const metadata: Metadata = {
  title: "Wall Art | FusionPrints",
  description:
    "Large-format wall art up to 16×20, printed in-house on professional stock. The statement piece most labs won't touch.",
};

const WA = "https://wa.me/263781387466";
const START = "/account/photos?size=11x14";

const WALL_BLURB: Record<string, string> = {
  "11x14": "Makes a statement.",
  "12x18": "A proper feature.",
  "16x20": "The centrepiece.",
};

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
    a: "Lustre. Its soft, low-glare sheen means no harsh reflections from windows or lights, and it resists fingerprints when you hang it. That's why it's our default for large prints.",
  },
  {
    q: "How do I prepare my photo for a large print?",
    a: "Just send us the best version you have, ideally the original full-resolution file. Upload it here and we'll guide you through cropping for your chosen size, or message it to us on WhatsApp and we'll handle the rest.",
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
              <Link
                href={START}
                className="inline-flex h-12 cursor-pointer items-center rounded-full bg-malachite px-8 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Start with wall art
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/40 shadow-lg">
            <Image src="/images/wallart-hero.jpg" alt="A large framed photographic print on a warm, minimal living-room wall" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" priority />
          </div>
        </Container>
      </section>

      {/* 2. Size cards */}
      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Pick your statement</h2>
          <p className="mt-2 text-ink-soft">Three sizes, each one built to be looked at.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sizes.map((p) => (
              <Link
                key={p.sizeCode}
                href={`/prints/${p.sizeCode}`}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-colors duration-200 hover:border-ink/25"
              >
                <div className="relative aspect-[4/3] bg-ink/5">
                  <Image src={`/images/card-wall-${p.sizeCode}.jpg`} alt={`A ${p.displayLabel} wall art print`} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
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

      {/* 3. Quality callout */}
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

      {/* 4. Finish guide */}
      <section className="bg-cream py-16">
        <Container>
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Glossy or lustre?</h2>
          <p className="mt-2 max-w-xl text-ink-soft">For wall art we lean lustre, but here&rsquo;s how they compare.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {[
              { name: "Glossy", img: "/images/finish-glossy.jpg", alt: "Close-up of a glossy print catching the light", body: "Bright, punchy, and reflective. Colours pop and blacks look deep. Best behind glass or where light is soft." },
              { name: "Lustre", img: "/images/finish-lustre.jpg", alt: "Close-up of a lustre print with a soft pearl sheen", body: "A soft, low-glare sheen that resists fingerprints and beats window reflections. Our default for wall art." },
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

      {/* 5. FAQ */}
      <section className="border-y border-ink/8 bg-white py-16">
        <Container className="max-w-3xl">
          <h2 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Good questions</h2>
          <div className="mt-8">
            <FaqAccordion items={FAQS} />
          </div>
        </Container>
      </section>

      {/* 6. Bottom CTA */}
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
              Start with wall art
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
