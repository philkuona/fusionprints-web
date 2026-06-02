import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "How it works — FusionPrints",
  description:
    "Order premium photo prints in minutes — fast on WhatsApp, or with full creative control on the web.",
};

const WA = "https://wa.me/263781387466";

export default function HowItWorksPage() {
  return (
    <div>
      {/* ── Hero — full-bleed photography ────────────────────────────── */}
      <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src="/images/upload.jpg"
          alt="A person holding a smartphone, about to send a photo for printing"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/30" />
        <Container className="pb-14 pt-32">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/70">
            Simple process
          </p>
          <h1 className="mt-4 font-fraunces text-5xl font-bold text-cream sm:text-6xl">
            How it works
          </h1>
          <p className="mt-4 max-w-lg text-lg text-cream/80">
            Print fast on WhatsApp. Get creative on the web. Both take minutes.
          </p>
        </Container>
      </section>

      <Container className="py-20">
        {/* Two flows */}
        <div className="grid gap-16 lg:grid-cols-2">
          {/* WhatsApp flow */}
          <div>
            <div className="relative mb-8 aspect-16/10 overflow-hidden rounded-3xl bg-ink/5 shadow-md">
              <Image
                src="/images/prints.jpg"
                alt="Hands holding a stack of freshly printed photographs"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-malachite-deep">
              Fast · WhatsApp
            </p>
            <h2 className="mt-3 font-fraunces text-3xl font-bold text-ink">
              Order in a conversation
            </h2>
            <div className="mt-8 space-y-8">
              {[
                {
                  step: "01",
                  title: "Send your photo",
                  body: "Message us your photo on WhatsApp. No app, no account — just a photo.",
                },
                {
                  step: "02",
                  title: "Choose a size",
                  body: "We'll show you the sizes available. Pick the one that fits your space.",
                },
                {
                  step: "03",
                  title: "Pay and collect",
                  body: "Pay by mobile money or cash. Your print is ready for collection or local delivery.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <p className="font-mono text-2xl font-medium text-malachite-deep">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
            >
              Start on WhatsApp
            </a>
          </div>

          {/* Web flow */}
          <div>
            <div className="relative mb-8 aspect-16/10 overflow-hidden rounded-3xl bg-ink/5 shadow-md">
              <Image
                src="/images/editing.jpg"
                alt="A laptop and phone on a desk, set up for editing photos before printing"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-malachite-deep">
              Creative · Web platform
            </p>
            <h2 className="mt-3 font-fraunces text-3xl font-bold text-ink">
              Edit, then print
            </h2>
            <div className="mt-8 space-y-8">
              {[
                {
                  step: "01",
                  title: "Create an account",
                  body: "Sign up with your email. Your photo library and order history are saved to your account.",
                },
                {
                  step: "02",
                  title: "Upload and edit",
                  body: "Upload your photo, crop it to your chosen print size, adjust brightness and colour.",
                },
                {
                  step: "03",
                  title: "Choose a size and checkout",
                  body: "Add to cart, enter your delivery address, and pay. We'll print and deliver to your door.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <p className="font-mono text-2xl font-medium text-malachite-deep">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 border-t border-ink/8 pt-16">
          <h2 className="font-fraunces text-2xl font-bold text-ink">
            Common questions
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                q: "What file types do you accept?",
                a: "JPEG and PNG. For best results, send the original full-resolution photo — not a screenshot or a photo saved from social media.",
              },
              {
                q: "How long does printing take?",
                a: "Most orders are printed within 24 hours. We'll notify you on WhatsApp when your order is ready.",
              },
              {
                q: "Do you deliver?",
                a: "Yes. Choose delivery to your door, or collect your order in person — whichever suits you.",
              },
              {
                q: "What if my photo resolution is too low?",
                a: "We'll warn you before you place the order. We'd rather tell you upfront than print something you're unhappy with.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-ink/10 bg-white p-6"
              >
                <h3 className="font-semibold text-ink">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
