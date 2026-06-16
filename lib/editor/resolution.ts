/**
 * Low-resolution gate — one source of truth for "is this enough pixels?".
 *
 * Used in two places:
 *   - the size picker, against the FULL photo (best-case, pre-crop) so we can
 *     flag sizes that can never print sharp before the user commits to one;
 *   - the crop modal, against the CROPPED pixel area, which is the real number
 *     that gets sent to print.
 *
 * Levels, by pixel area against the product's published thresholds:
 *   ok   — at or above recommended; prints sharp.
 *   warn — below recommended but at or above minimum; may look a little soft.
 *   bad  — below minimum; likely to look blurry. This is the gated case.
 */
import type { CatalogProduct } from "@/lib/api/catalog";

export type ResLevel = "ok" | "warn" | "bad";

/** Area (in px²) at or above which a print is sharp / acceptable. */
export function thresholds(product: CatalogProduct): { min: number; rec: number } {
  return {
    min: product.minResolution.width * product.minResolution.height,
    rec: product.recommendedResolution.width * product.recommendedResolution.height,
  };
}

/** Grade a pixel area against a product. `null` area is treated as ok (unknown). */
export function resLevelForArea(area: number | null, product: CatalogProduct): ResLevel {
  if (area === null) return "ok";
  const { min, rec } = thresholds(product);
  return area < min ? "bad" : area < rec ? "warn" : "ok";
}
