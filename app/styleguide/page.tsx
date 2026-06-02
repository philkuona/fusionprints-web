import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide — FusionPrints",
};

const SWATCHES: { name: string; token: string; hex: string; dark?: boolean }[] = [
  { name: "Cream", token: "bg-cream", hex: "#FBF7F0" },
  { name: "Ink", token: "bg-ink", hex: "#1F1B16", dark: true },
  { name: "Malachite", token: "bg-malachite", hex: "#05D668" },
  { name: "Malachite Deep", token: "bg-malachite-deep", hex: "#04A551", dark: true },
  { name: "Coral", token: "bg-coral", hex: "#FF7A59" },
  { name: "Amber", token: "bg-amber", hex: "#EFAB11" },
  { name: "Ink Soft", token: "bg-ink-soft", hex: "#4A3F32", dark: true },
  { name: "Ink Mute", token: "bg-ink-mute", hex: "#8A7B66", dark: true },
];

const OUTFIT_WEIGHTS: { label: string; cls: string }[] = [
  { label: "Outfit 400 — Regular", cls: "font-normal" },
  { label: "Outfit 500 — Medium", cls: "font-medium" },
  { label: "Outfit 600 — SemiBold", cls: "font-semibold" },
  { label: "Outfit 700 — Bold", cls: "font-bold" },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-mute">
        Internal · Sunlit tokens
      </p>
      <h1 className="mt-2 font-fraunces text-4xl font-bold text-ink">
        Styleguide
      </h1>

      {/* Signature line */}
      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-mute">
          Signature
        </h2>
        <p className="mt-4 font-fraunces text-5xl font-bold leading-tight text-malachite sm:text-6xl">
          Hold the moment.
        </p>
        <p className="mt-3 max-w-md text-ink-soft">
          Fraunces 700, Malachite. The brand&rsquo;s signature line — always
          present with prominence on key surfaces.
        </p>
      </section>

      {/* Colour palette */}
      <section className="mt-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-mute">
          Palette
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              className="overflow-hidden rounded-xl border border-ink/10"
            >
              <div className={`${s.token} h-24 w-full`} />
              <div className="bg-white px-3 py-2">
                <p className="text-sm font-semibold text-ink">{s.name}</p>
                <p className="font-mono text-xs text-ink-mute">{s.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mt-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-mute">
          Typography
        </h2>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-ink-mute">Fraunces — headlines</p>
          <p className="font-fraunces text-5xl font-bold text-ink">
            Your photos deserve to be printed.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-ink-mute">Outfit — body &amp; UI</p>
          {OUTFIT_WEIGHTS.map((w) => (
            <p key={w.cls} className={`${w.cls} text-2xl text-ink`}>
              {w.label} — Moments worth keeping.
            </p>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-sm text-ink-mute">DM Mono — prices, order refs</p>
          <p className="font-mono text-2xl font-medium text-ink">
            FP-2026-00417 · USD 24.00 · 16&times;20
          </p>
        </div>
      </section>
    </main>
  );
}
