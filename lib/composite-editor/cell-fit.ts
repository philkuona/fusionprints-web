/**
 * Per-cell cover-fit math for the composite editor — the SINGLE source of truth
 * for how a photo is positioned inside a cell, shared in spirit with the print
 * agent's Sharp renderer (fusionprints-agent/src/composite-renderer.ts). The two
 * MUST stay in lockstep or the printed sheet won't match the preview.
 *
 * Model (identical both sides):
 *   - The photo always *covers* the cell (no white gaps ever).
 *   - `scale` is a zoom multiplier on top of cover (1 = exactly cover, >1 zoomed in).
 *   - `panX`/`panY` ∈ [-1, 1] are slack-relative: 0 = centred, ±1 = an edge of the
 *     photo flush with the cell edge. Because pan is a fraction of the available
 *     slack, it is aspect-independent and can never reveal background.
 *   - `rotation` (0|90|180|270) is applied to the source before cover-fitting.
 *
 * Web renders an absolutely-positioned <img> using the returned px box + a CSS
 * rotate(); the agent resizes the source to (coverW × coverH) then extracts the
 * cell-sized window at (hiddenLeft, hiddenTop). Same geometry, two outputs.
 */

export type CellRotation = 0 | 90 | 180 | 270;

export interface CellFitInput {
  /** Inner content box of the cell in screen px (cell minus any border). */
  innerW: number;
  innerH: number;
  /** Natural (unrotated) source pixel dimensions. */
  natW: number;
  natH: number;
  scale: number; // >= 1
  panX: number; // [-1, 1]
  panY: number; // [-1, 1]
  rotation: CellRotation;
}

export interface CellFit {
  /** <img> element box (pre-rotation) in px, to place absolutely in the cell. */
  elemW: number;
  elemH: number;
  left: number;
  top: number;
  rotation: CellRotation;
  /** Painted overflow beyond the cell on each axis (px). 0 → that axis can't pan. */
  slackX: number;
  slackY: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Compute the placement of a photo inside a cell. The painted footprint
 * (coverW × coverH) always ≥ the cell, so no gaps. For 90°/270° the <img>
 * element box is swapped so that, after CSS rotate, the painted footprint still
 * matches (and object-cover fits the natural aspect exactly).
 */
export function coverFit(input: CellFitInput): CellFit {
  const { innerW, innerH, natW, natH, rotation } = input;
  const scale = Math.max(1, input.scale);
  const panX = clamp(input.panX, -1, 1);
  const panY = clamp(input.panY, -1, 1);

  const rotated = rotation === 90 || rotation === 270;
  // Oriented source dims (aspect only; values are source px).
  const sW = rotated ? natH : natW;
  const sH = rotated ? natW : natH;

  // Smallest uniform scale (screen px per source px) that covers the cell, then zoom.
  const coverBase = Math.max(innerW / sW, innerH / sH);
  const coverW = sW * coverBase * scale; // painted footprint (axis-aligned to cell)
  const coverH = sH * coverBase * scale;

  const slackX = Math.max(0, coverW - innerW);
  const slackY = Math.max(0, coverH - innerH);

  // Centre then shift by pan over the available slack.
  const shiftX = (slackX / 2) * panX;
  const shiftY = (slackY / 2) * panY;

  // Pre-rotation element box: swap for quarter turns so the post-rotate footprint
  // is coverW × coverH and object-cover matches the natural aspect.
  const elemW = rotated ? coverH : coverW;
  const elemH = rotated ? coverW : coverH;

  const left = innerW / 2 + shiftX - elemW / 2;
  const top = innerH / 2 + shiftY - elemH / 2;

  return { elemW, elemH, left, top, rotation, slackX, slackY };
}

/**
 * Convert a pixel drag on the active cell into a pan delta. Returns 0 on an axis
 * with no slack (so a non-overflowing axis can't be dragged into white space).
 */
export function dragToPan(dxPx: number, slackPx: number): number {
  if (slackPx <= 0) return 0;
  return dxPx / (slackPx / 2);
}
