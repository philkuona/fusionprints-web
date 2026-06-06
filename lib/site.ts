/**
 * Canonical site identity for SEO (metadata, sitemap, robots, OG).
 *
 * SITE_URL is env-driven so it can move to the apex domain at launch without a
 * code change. Defaults to the current live app host.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.fusionprints.co.zw"
).replace(/\/+$/, "");

export const SITE_NAME = "FusionPrints";

export const SITE_DESCRIPTION =
  "Premium photo prints and wall art. Order on WhatsApp or design your own online.";

/** Public, indexable marketing routes (no auth, no app flows). */
export const PUBLIC_ROUTES = [
  "",
  "/prints",
  "/wall-art",
  "/how-it-works",
  "/about",
  "/shipping",
  "/privacy",
  "/terms",
];

/** App/private route prefixes that must not be indexed. */
export const PRIVATE_PREFIXES = [
  "/account",
  "/editor",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/verify",
  "/styleguide",
];
