/**
 * Lightweight assertions for crop-math (no test framework yet).
 * Run: node lib/edit/crop-math.check.ts   (Node 22.18+ strips types natively)
 */
import {
  coverScale,
  fitFrame,
  clampImagePos,
  computeNormalizedCrop,
  croppedPixels,
  type Rect,
} from "./crop-math.ts";

let failures = 0;
function ok(name: string, cond: boolean) {
  if (!cond) {
    failures++;
    console.error("FAIL:", name);
  } else {
    console.log("ok  :", name);
  }
}
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

// fitFrame keeps the requested aspect ratio and centers within the stage.
const f = fitFrame(800, 600, 8, 10, 16); // portrait frame in a landscape stage
ok("fitFrame aspect = 8:10", near(f.width / f.height, 8 / 10));
ok("fitFrame fits height", f.height <= 600 - 32 + 1e-9);
ok("fitFrame centered x", near(f.x + f.width / 2, 400));

// coverScale: a 2000x1000 image covering an 800x600 frame must cover the tall side.
ok("coverScale covers", coverScale(2000, 1000, 800, 600) === Math.max(800 / 2000, 600 / 1000));

// computeNormalizedCrop: frame centered over an image 2x the frame, centered →
// crop is the middle 50% on each axis.
const frame: Rect = { x: 100, y: 100, width: 200, height: 250 };
const imageRect: Rect = { x: 0, y: 0, width: 400, height: 500 };
const crop = computeNormalizedCrop(frame, imageRect);
ok("crop.x", near(crop.x, 0.25));
ok("crop.y", near(crop.y, 0.2));
ok("crop.width", near(crop.width, 0.5));
ok("crop.height", near(crop.height, 0.5));

// THE 2.2.2 GATE: the cropped region's aspect ratio always equals the frame's,
// regardless of image position/scale — because crop dims = frame dims / imageRect dims.
function gateHolds(framePr: Rect, img: Rect, natW: number, natH: number): boolean {
  const c = computeNormalizedCrop(framePr, img);
  const px = croppedPixels(c, natW, natH);
  const frameAspect = framePr.width / framePr.height;
  const cropAspect = (c.width * natW) / (c.height * natH);
  return near(frameAspect, cropAspect, 1e-3) && px.width > 0 && px.height > 0;
}
ok(
  "2.2.2 gate: crop aspect == frame aspect (centered)",
  gateHolds({ x: 100, y: 100, width: 200, height: 250 }, { x: 0, y: 0, width: 400, height: 500 }, 4000, 5000),
);
ok(
  "2.2.2 gate: crop aspect == frame aspect (panned/zoomed)",
  gateHolds({ x: 100, y: 100, width: 200, height: 250 }, { x: -130, y: -60, width: 900, height: 1125 }, 4000, 5000),
);

// clampImagePos: keep the frame fully covered.
const clamped = clampImagePos({ x: 999, y: 999 }, { width: 400, height: 500 }, frame);
ok("clamp maxX (left edge can't pass frame.x)", clamped.x === frame.x);
ok("clamp maxY", clamped.y === frame.y);
const clamped2 = clampImagePos({ x: -999, y: -999 }, { width: 400, height: 500 }, frame);
ok("clamp minX (right edge stays >= frame right)", near(clamped2.x, frame.x + frame.width - 400));

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
if (failures > 0) process.exit(1);
