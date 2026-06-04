/**
 * Pure geometry for the fixed-frame crop (Phase 2.2, S2).
 *
 * The crop frame is locked to the print's aspect ratio; the image pans/zooms
 * behind it, always covering it. These functions translate the on-screen
 * (stage-space) image + frame rectangles into a resolution-independent crop
 * expressed as normalized [0,1] fractions of the ORIGINAL (upright) image — the
 * exact contract the server applier consumes. No rotation here (that's S3).
 *
 * Everything is pure and framework-free so it can be unit-tested in isolation;
 * the 2.2.2 gate ("an 8x10 crop cannot produce a non-8x10 output") rests on it.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

const clamp01 = (v: number): number => clamp(v, 0, 1);

/** Minimum scale so a (natW x natH) image fully covers a (frameW x frameH) frame. */
export function coverScale(
  natW: number,
  natH: number,
  frameW: number,
  frameH: number,
): number {
  return Math.max(frameW / natW, frameH / natH);
}

/**
 * Fit a frame of aspect `aspectW:aspectH` inside `stage`, centered, with padding.
 * Returns the frame rect in stage coordinates.
 */
export function fitFrame(
  stageW: number,
  stageH: number,
  aspectW: number,
  aspectH: number,
  pad = 16,
): Rect {
  const availW = Math.max(0, stageW - pad * 2);
  const availH = Math.max(0, stageH - pad * 2);
  let w = availW;
  let h = (w * aspectH) / aspectW;
  if (h > availH) {
    h = availH;
    w = (h * aspectW) / aspectH;
  }
  return { x: (stageW - w) / 2, y: (stageH - h) / 2, width: w, height: h };
}

/**
 * Fit a frame of aspect `aspectW:aspectH` inside `stage` with a CONSTANT height
 * (stageH minus padding) so the on-screen height stays the same across print
 * sizes; only the width changes with the aspect. If the resulting width would
 * overflow, it's capped (and height reduced) so it still fits.
 */
export function fitFrameByHeight(
  stageW: number,
  stageH: number,
  aspectW: number,
  aspectH: number,
  pad = 16,
): Rect {
  const maxW = Math.max(0, stageW - pad * 2);
  let h = Math.max(0, stageH - pad * 2);
  let w = (h * aspectW) / aspectH;
  if (w > maxW) {
    w = maxW;
    h = (w * aspectH) / aspectW;
  }
  return { x: (stageW - w) / 2, y: (stageH - h) / 2, width: w, height: h };
}

/**
 * Clamp an image's top-left position so it still fully covers the frame
 * (no empty gutters). `imageSize` is the displayed (scaled) size.
 */
export function clampImagePos(
  pos: { x: number; y: number },
  imageSize: { width: number; height: number },
  frame: Rect,
): { x: number; y: number } {
  const minX = frame.x + frame.width - imageSize.width; // right edges aligned
  const maxX = frame.x; // left edges aligned
  const minY = frame.y + frame.height - imageSize.height;
  const maxY = frame.y;
  return {
    // When the image is larger than the frame, min < max (normal clamp).
    // Guard the degenerate equal case so we don't invert the bounds.
    x: minX <= maxX ? clamp(pos.x, minX, maxX) : maxX,
    y: minY <= maxY ? clamp(pos.y, minY, maxY) : maxY,
  };
}

/**
 * Translate the displayed image rect + frame rect (same stage-space) into a
 * normalized [0,1] crop against the natural image. Assumes the image covers the
 * frame (caller clamps via clampImagePos).
 */
export function computeNormalizedCrop(frame: Rect, imageRect: Rect): Rect {
  return {
    x: clamp01((frame.x - imageRect.x) / imageRect.width),
    y: clamp01((frame.y - imageRect.y) / imageRect.height),
    width: clamp01(frame.width / imageRect.width),
    height: clamp01(frame.height / imageRect.height),
  };
}

/** Cropped region size in original pixels, from a normalized crop. */
export function croppedPixels(
  crop: Rect,
  naturalW: number,
  naturalH: number,
): { width: number; height: number } {
  return {
    width: Math.round(crop.width * naturalW),
    height: Math.round(crop.height * naturalH),
  };
}
