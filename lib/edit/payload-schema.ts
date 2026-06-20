/**
 * Edit payload — MIRROR of the canonical schema at
 * fusionprints/src/schemas/edit-payload.ts. Keep the two in sync (bump
 * EDIT_SCHEMA_VERSION on breaking changes). The server validates; this client
 * copy is for type-safety + building the payload + the live preview filter.
 */

export const EDIT_SCHEMA_VERSION = 1 as const;

export type Orientation = "portrait" | "landscape" | "square";
export type Rotation = 0 | 90 | 180 | 270;
export type FilterId = "none" | "bw" | "sepia" | "vintage";

export interface EditCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: Orientation;
}

export interface EditAdjustments {
  brightness: number; // [-1,1]
  contrast: number; // [-1,1]
  saturation: number; // [-1,1]
  exposure: number; // [-2,2] stops
}

export interface EditPayload {
  schemaVersion: typeof EDIT_SCHEMA_VERSION;
  sourceImageId: string;
  sizeCode: string;
  crop: EditCrop;
  rotate: Rotation;
  flipH: boolean;
  flipV: boolean;
  adjustments: EditAdjustments;
  autoEnhance: boolean;
  filterId: FilterId;
  border: boolean;
  paper: "glossy" | "lustre";
}

export const ZERO_ADJUSTMENTS: EditAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
};

// Deterministic auto-enhance nudges — must match AUTO_ENHANCE in the server applier.
export const AUTO_ENHANCE: EditAdjustments = {
  brightness: 0.05,
  contrast: 0.1,
  saturation: 0.08,
  exposure: 0,
};

/**
 * CSS-filter approximation of the colour pipeline, for the LIVE preview only.
 * The exact result is rendered server-side (Sharp) on Save — this is a close,
 * fast preview, not pixel-perfect parity.
 */
export function buildCssFilter(
  adj: EditAdjustments,
  filterId: FilterId,
  autoEnhance: boolean,
): string {
  const a = autoEnhance
    ? {
        brightness: adj.brightness + AUTO_ENHANCE.brightness,
        contrast: adj.contrast + AUTO_ENHANCE.contrast,
        saturation: adj.saturation + AUTO_ENHANCE.saturation,
        exposure: adj.exposure + AUTO_ENHANCE.exposure,
      }
    : adj;
  const bright = Math.pow(2, a.exposure) * (1 + a.brightness);
  const parts = [`brightness(${bright.toFixed(3)})`, `contrast(${(1 + a.contrast).toFixed(3)})`, `saturate(${(1 + a.saturation).toFixed(3)})`];
  if (filterId === "bw") parts.push("grayscale(1)");
  else if (filterId === "sepia") parts.push("sepia(0.85)");
  else if (filterId === "vintage") parts.push("sepia(0.4) contrast(1.05) saturate(0.9)");
  return parts.join(" ");
}
