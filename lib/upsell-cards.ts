/**
 * Homepage upsell cards. Data-driven so new products can be promoted by adding
 * an entry here — no component changes. Images are Gemini-generated brand assets
 * (text is rendered as HTML in the card, never baked into the image).
 */

export interface UpsellCardData {
  id: string;
  image: string;
  /** Describes the actual scene (accessibility) — never placeholder text. */
  alt: string;
  headline: string;
  subline: string;
  ctaText: string;
  href: string;
}

export const UPSELL_CARDS: UpsellCardData[] = [
  {
    id: "mini-prints",
    image: "/images/upsell-mini-prints.jpg",
    alt: "A freshly printed sheet holding two mini photos of laughing teenage friends, side by side with a dashed cut-line down the middle",
    headline: "Two prints. One sheet.",
    subline: "Mini prints, side by side — cut along the line and share.",
    ctaText: "Try Mini Prints",
    href: "/prints/mini",
  },
];
