import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About | FusionPrints",
  description:
    "Premium photo printing, done in-house. From everyday snapshots to large-format wall art. Printed, checked, and delivered with care.",
};

const WA = "https://wa.me/263781387466";

const SOCIAL = [
  { label: "Instagram", handle: "@fusionprints.zw", href: "https://instagram.com/fusionprints.zw" },
  { label: "Facebook", handle: "FusionPrints", href: "https://facebook.com/fusionprints" },
  { label: "WhatsApp", handle: "+263 781 387 466", href: WA },
];

const PROMISES = [
  {
    title: "In-house printing",
    body: "Every order is printed on our own professional equipment. Your photo never leaves our hands until it reaches yours.",
  },
  {
    title: "Colour correction included",
    body: "Our team reviews every image before it prints. If something looks off, we fix it, at no extra charge.",
  },
  {
    title: "Quick turnaround",
    body: "Most orders are ready within 24 hours. We’ll let you know the moment your print is ready.",
  },
  {
    title: "Honest quality checks",
    body: "If a photo isn’t sharp enough for the size you’ve chosen, we’ll tell you before you pay, not after.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Header — typography only ─────────────────────────────────── */}
      <section className="border-b border-ink/8 bg-cream">
        <Container className="py-20 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-malachite-deep">
            About
          </p>
          <h1 className="mt-4 max-w-3xl font-fraunces text-5xl font-bold leading-[0.98] text-ink sm:text-6xl">
            We print what matters.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            A photo and poster printing service built on one idea: the moments
            worth keeping deserve to be held, not lost in a camera roll.
          </p>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* Main content */}
          <div className="space-y-12">
            <div>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                What FusionPrints is
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                We print everything in-house, from classic 4×6 snapshots to
                large-format wall art up to 16×20 inches. No outsourcing, no third
                parties touching your photos.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Order through WhatsApp for a fast, simple experience, or use our web
                platform for full creative control: cropping, editing, and custom
                layouts before your photo goes to print.
              </p>
            </div>

            {/* Single lifestyle image */}
            <div className="relative aspect-16/10 overflow-hidden rounded-3xl bg-ink/5 shadow-md">
              <Image
                src="/images/about-lifestyle.jpg"
                alt="A grandmother and grandchild on a sofa beside a gallery wall of framed prints in soft daylight"
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                What we promise
              </h2>
              <div className="mt-5 space-y-4">
                {PROMISES.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-malachite" />
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-semibold text-ink">Get in touch</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Questions, bulk orders, or anything else, message us on WhatsApp.
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
