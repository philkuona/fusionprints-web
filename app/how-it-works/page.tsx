import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "How it works — FusionPrints",
  description:
    "Order premium photo prints in minutes — fast on WhatsApp, or with full creative control on the web.",
};

const WA = "https://wa.me/263781387466";

/* ── Line icons (Lucide-style, no photography) ─────────────────────── */

type IconProps = { className?: string };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1-4.5a8.5 8.5 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3 8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}
function RulerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M3 16 16 3l5 5L8 21z" />
      <path d="M7 12l2 2M11 8l2 2M15 4l2 2" />
    </svg>
  );
}
function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2" />
      <circle cx="16.5" cy="12.5" r="1" />
    </svg>
  );
}
function UserPlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M15 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="8.5" cy="8" r="3.5" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}
function SlidersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 6h11M19 6h1M4 12h1M9 12h11M4 18h7M15 18h5" />
      <circle cx="17" cy="6" r="2" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="13" cy="18" r="2" />
    </svg>
  );
}
function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

/* ── Step data ─────────────────────────────────────────────────────── */

type Step = { icon: ReactNode; title: string; body: string };

const WHATSAPP_STEPS: Step[] = [
  {
    icon: <ChatIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Send your photo",
    body: "Message us your photo on WhatsApp. No app, no account — just a photo and a hello.",
  },
  {
    icon: <RulerIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Choose a size",
    body: "We’ll show you the sizes that suit your photo and confirm it’s sharp enough to print.",
  },
  {
    icon: <WalletIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Pay and collect",
    body: "Pay by mobile money or cash. Your print is ready for collection or delivery, usually next day.",
  },
];

const WEB_STEPS: Step[] = [
  {
    icon: <UserPlusIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Create an account",
    body: "Sign up with your email. Your photo library and order history stay saved to your account.",
  },
  {
    icon: <SlidersIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Upload and edit",
    body: "Upload your photo, crop it to your chosen size, and fine-tune brightness and colour.",
  },
  {
    icon: <TruckIcon className="h-6 w-6 text-malachite-deep" />,
    title: "Choose a size and checkout",
    body: "Add to cart, enter your delivery address, and pay. We print and deliver to your door.",
  },
];

const FAQ = [
  {
    q: "What file types do you accept?",
    a: "JPEG and PNG. For best results, send the original full-resolution photo — not a screenshot or a photo saved from social media.",
  },
  {
    q: "How long does printing take?",
    a: "Most orders are printed within 24 hours. We’ll notify you on WhatsApp as soon as your order is ready.",
  },
  {
    q: "Do you deliver?",
    a: "Yes. Choose delivery to your door, or collect your order in person — whichever suits you.",
  },
  {
    q: "What if my photo resolution is too low?",
    a: "We’ll warn you before you place the order. We’d rather tell you upfront than print something you’re unhappy with.",
  },
];

/* ── Flow column ───────────────────────────────────────────────────── */

function Flow({
  eyebrow,
  title,
  steps,
  cta,
}: {
  eyebrow: string;
  title: string;
  steps: Step[];
  cta: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-8 sm:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-malachite-deep">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-fraunces text-3xl font-bold text-ink">{title}</h2>
      <ol className="mt-8 space-y-7">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-malachite/10">
              {s.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-ink-mute">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold text-ink">{s.title}</h3>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-9">{cta}</div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div>
      {/* ── Header — typography only ─────────────────────────────────── */}
      <section className="border-b border-ink/8 bg-cream">
        <Container className="py-20 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-malachite-deep">
            How it works
          </p>
          <h1 className="mt-4 max-w-3xl font-fraunces text-5xl font-bold leading-[0.98] text-ink sm:text-6xl">
            Two ways to order. Both take minutes.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Print fast in a WhatsApp conversation, or take full creative control
            on the web. Whichever you choose, every print is checked by hand.
          </p>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <Flow
            eyebrow="Fast · WhatsApp"
            title="Order in a conversation"
            steps={WHATSAPP_STEPS}
            cta={
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 cursor-pointer items-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
              >
                Start on WhatsApp
              </a>
            }
          />
          <Flow
            eyebrow="Creative · Web platform"
            title="Edit, then print"
            steps={WEB_STEPS}
            cta={
              <Link
                href="/signup"
                className="inline-flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Create an account
              </Link>
            }
          />
        </div>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <div className="mt-20 border-t border-ink/8 pt-16">
          <h2 className="font-fraunces text-3xl font-bold text-ink">
            Common questions
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-ink/10 bg-white p-6">
                <h3 className="font-semibold text-ink">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
