import type { Photo } from "@/lib/api/photos";

export type Orientation = "portrait" | "landscape" | "square";

export function isSquareSize(sizeCode: string): boolean {
  const [a, b] = sizeCode.split("x").map(Number);
  return a === b;
}

/** Oriented frame aspect (w, h) for a size + orientation. */
export function orientedAspect(sizeCode: string, orientation: Orientation): [number, number] {
  const [a, b] = sizeCode.split("x").map(Number);
  const small = Math.min(a, b);
  const large = Math.max(a, b);
  if (orientation === "square") return [a, b];
  return orientation === "landscape" ? [large, small] : [small, large];
}

/** Portrait/landscape that matches the photo's own orientation. */
export function photoOrientation(photo: Photo): Orientation {
  return (photo.widthPx ?? 0) > (photo.heightPx ?? 0) ? "landscape" : "portrait";
}

/** Sensible default orientation for a size given the photo (square sizes fixed). */
export function defaultOrientation(sizeCode: string, photo: Photo): Orientation {
  return isSquareSize(sizeCode) ? "square" : photoOrientation(photo);
}

/**
 * White-border option per size (inches), or null if the size offers no border.
 * ¼" for the small photo prints, ½" for 8x10/11x14, none for larger wall art.
 * MUST match borderInchesForSize in the backend applier.
 */
export function borderInchesForSize(sizeCode: string): number | null {
  if (["4x6", "5x7", "6x6", "6x8"].includes(sizeCode)) return 0.25;
  if (["8x10", "11x14"].includes(sizeCode)) return 0.5;
  return null;
}
