import Link from "next/link";
import Image from "next/image";
import type { UpsellCardData } from "@/lib/upsell-cards";

/**
 * Homepage upsell card. The Gemini-generated visual fills the card; the
 * headline / subline / CTA / tagline are crisp HTML over the image's cream
 * space (brand fonts, exact colours, accessible — never baked into the image).
 */
export function UpsellCard({ card }: { card: UpsellCardData }) {
  return (
    <Link
      href={card.href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-cream shadow-md ring-1 ring-ink/10 transition-shadow duration-200 hover:shadow-xl"
    >
      {/* Visual on top (square crop centres the sheet); text never overlaps it. */}
      <div className="relative aspect-square w-full bg-cream">
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover"
        />
      </div>
      <div className="px-6 pb-6 pt-5 text-center">
        <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-malachite" />
        <h3 className="font-fraunces text-2xl font-bold leading-tight text-ink">{card.headline}</h3>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">{card.subline}</p>
        <span className="mt-4 inline-flex h-10 items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 group-hover:bg-malachite-deep group-hover:text-cream">
          {card.ctaText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-3 font-fraunces text-[11px] font-medium italic text-malachite">Hold the moment.</p>
      </div>
    </Link>
  );
}
