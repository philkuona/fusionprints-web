import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";

/** Login/sign-up brand collage — every image is a unique Gemini generation. */
const COLLAGE = [
  { src: "/images/auth-collage-1.jpg", alt: "Hands sliding a printed photograph into a wooden frame" },
  { src: "/images/auth-collage-2.jpg", alt: "A woman by a window smiling at a small stack of printed photos" },
  { src: "/images/auth-collage-3.jpg", alt: "A flat lay of printed photographs fanned across linen" },
  { src: "/images/auth-collage-4.jpg", alt: "A child holding up a framed photograph, laughing" },
];

const PROMISES = [
  { title: "Printed in-house", desc: "On our own equipment, never outsourced." },
  { title: "Checked by hand", desc: "Colour-corrected before it ever prints." },
  { title: "Ready in 24 hours", desc: "For collection or delivery." },
];

/**
 * Full-bleed split-screen auth chrome. The global header/footer are hidden on
 * auth routes (see AppShell). Left: image collage + promises foot (desktop).
 * Right: scrollable form column.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-cream">
      {/* Brand collage panel — desktop only */}
      <aside className="relative hidden w-[44%] shrink-0 flex-col overflow-hidden bg-ink lg:flex">
        {/* Logo over the collage */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-ink/75 to-transparent p-8 xl:p-10">
          <Link
            href="/"
            aria-label="FusionPrints home"
            className="pointer-events-auto block w-fit cursor-pointer"
          >
            <Logo variant="on-dark" height={36} />
          </Link>
        </div>

        {/* 2×2 collage */}
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
          {COLLAGE.map((img) => (
            <div key={img.src} className="relative overflow-hidden bg-ink/40">
              <Image src={img.src} alt={img.alt} fill priority sizes="22vw" className="object-cover" />
            </div>
          ))}
        </div>

        {/* Promises appended to the foot — Mpix-style row with dividers */}
        <div className="border-t border-cream/10 px-6 py-7">
          <div className="grid grid-cols-3 divide-x divide-cream/10 text-center">
            {PROMISES.map((p) => (
              <div key={p.title} className="px-3">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-cream">
                  {p.title}
                </p>
                <p className="mx-auto mt-1.5 max-w-[18ch] text-[11px] leading-snug text-cream/55">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar: mobile logo + back-to-site link */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" aria-label="FusionPrints home" className="cursor-pointer lg:hidden">
            <Logo variant="color" height={34} />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-mute transition-colors duration-200 hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to site
          </Link>
        </div>

        {/* Centered block (not a flex item) — shrinks cleanly on mobile */}
        <div className="mx-auto my-auto w-full max-w-md px-6 pb-12 sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
