import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About — FusionPrints",
  description:
    "Premium photo printing, done in-house. From everyday snapshots to large-format wall art — printed, checked, and delivered with care.",
};

const WA = "https://wa.me/263781387466";

// ⚠️ Update social handles before launch
const SOCIAL = [
  { label: "Instagram", handle: "@fusionprints", href: "https://instagram.com/fusionprints" },
  { label: "Facebook", handle: "FusionPrints", href: "https://facebook.com/fusionprints" },
  { label: "WhatsApp", handle: "+263 781 387 466", href: WA },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero — full-bleed photography ────────────────────────────── */}
      <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src="/images/detail.jpg"
          alt="A close-up of printed photographs being held in hand"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/30" />
        <Container className="pb-14 pt-32">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/70">
            About
          </p>
          <h1 className="mt-4 font-fraunces text-5xl font-bold text-cream sm:text-6xl">
            We print what matters.
          </h1>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
          {/* Main content */}
          <div className="space-y-12">
            {/* What we are */}
            <div>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                What FusionPrints is
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                FusionPrints is a photo and poster printing service. We print
                everything in-house — from classic 4×6 snapshots to large-format
                wall art up to 16×20 inches. No outsourcing, no third parties.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                You can order through WhatsApp for a fast, simple experience, or use
                our web platform for full creative control — cropping, editing, and
                custom layouts before your photo goes to print.
              </p>
            </div>

            {/* Lifestyle image */}
            <div className="relative aspect-16/9 overflow-hidden rounded-3xl bg-ink/5 shadow-md">
              <Image
                src="/images/gallery.jpg"
                alt="A styled wall of framed photo prints in a warm home interior"
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* Service promises */}
            <div>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                What we promise
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  {
                    title: "In-house printing",
                    body: "Every order is printed at our own lab on professional equipment. Your order never leaves our hands until it reaches yours.",
                  },
                  {
                    title: "Colour correction included",
                    body: "Our team reviews every image before it prints. If something looks off, we fix it. No extra charge.",
                  },
                  {
                    title: "Quick turnaround",
                    body: "Most orders are ready within 24 hours. We'll let you know as soon as your print is ready.",
                  },
                  {
                    title: "Honest quality checks",
                    body: "We'll tell you if your photo resolution isn't high enough for a good print — before you pay, not after.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-malachite" />
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — contact + social */}
          <div className="space-y-8">
            {/* Get in touch */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-semibold text-ink">Get in touch</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Questions, bulk orders, or anything else — message us on WhatsApp.
              </p>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex h-11 cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Message us
              </a>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-semibold text-ink">Find us</h3>
              <ul className="mt-4 space-y-3">
                {SOCIAL.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex cursor-pointer items-center justify-between text-sm transition-colors duration-200 hover:text-malachite-deep"
                    >
                      <span className="text-ink-mute">{s.label}</span>
                      <span className="font-medium text-ink">{s.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
