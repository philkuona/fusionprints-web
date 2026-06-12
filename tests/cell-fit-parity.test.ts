/**
 * Cell-fit parity — web side (audit IMP-1 wave 2).
 *
 * coverFit() drives the composite editor's live preview. It MUST stay in
 * lockstep with the print agent's computeCellWindow(); both sides are
 * asserted against the SAME fixtures (tests/fixtures/cell-fit-parity.json,
 * identical copy in fusionprints-agent). The web math is float-exact, so
 * expectations are asserted exactly; the agent side allows ±1px for rounding.
 *
 * coverFit returns the pre-rotation <img> element box; the painted footprint
 * (what the agent calls coverW × coverH) is that box swapped for quarter
 * turns, and hiddenLeft/hiddenTop are how far the footprint overhangs the
 * cell: hidden = footprintSize/2 - elementCenter.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { coverFit, dragToPan, type CellRotation } from "../lib/composite-editor/cell-fit";

interface Fixture {
  name: string;
  innerW: number;
  innerH: number;
  natW: number;
  natH: number;
  scale: number;
  panX: number;
  panY: number;
  rotation: CellRotation;
  expected: {
    coverW: number;
    coverH: number;
    slackX: number;
    slackY: number;
    hiddenLeft: number;
    hiddenTop: number;
  };
}

const { fixtures } = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "cell-fit-parity.json"), "utf8"),
) as { fixtures: Fixture[] };

describe("coverFit matches the shared parity fixtures (exact)", () => {
  it.each(fixtures.map((f) => [f.name, f] as const))("%s", (_name, f) => {
    const fit = coverFit({
      innerW: f.innerW,
      innerH: f.innerH,
      natW: f.natW,
      natH: f.natH,
      scale: f.scale,
      panX: f.panX,
      panY: f.panY,
      rotation: f.rotation,
    });

    const rotated = f.rotation === 90 || f.rotation === 270;
    const footW = rotated ? fit.elemH : fit.elemW;
    const footH = rotated ? fit.elemW : fit.elemH;
    const hiddenLeft = footW / 2 - (fit.left + fit.elemW / 2);
    const hiddenTop = footH / 2 - (fit.top + fit.elemH / 2);

    expect(footW).toBeCloseTo(f.expected.coverW, 6);
    expect(footH).toBeCloseTo(f.expected.coverH, 6);
    expect(fit.slackX).toBeCloseTo(f.expected.slackX, 6);
    expect(fit.slackY).toBeCloseTo(f.expected.slackY, 6);
    expect(hiddenLeft).toBeCloseTo(f.expected.hiddenLeft, 6);
    expect(hiddenTop).toBeCloseTo(f.expected.hiddenTop, 6);

    // Cover invariant: the painted footprint never reveals cell background.
    expect(footW).toBeGreaterThanOrEqual(f.innerW - 1e-9);
    expect(footH).toBeGreaterThanOrEqual(f.innerH - 1e-9);
    expect(hiddenLeft).toBeGreaterThanOrEqual(-1e-9);
    expect(hiddenTop).toBeGreaterThanOrEqual(-1e-9);
    expect(hiddenLeft).toBeLessThanOrEqual(fit.slackX + 1e-9);
    expect(hiddenTop).toBeLessThanOrEqual(fit.slackY + 1e-9);
  });
});

// The two fixture copies must never drift. Checked from the web side only
// (skips when the agent checkout isn't a sibling, e.g. in CI).
const AGENT_FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", "..", "fusionprints-agent", "tests", "fixtures", "cell-fit-parity.json",
);

describe.skipIf(!existsSync(AGENT_FIXTURES))("fixture copies", () => {
  it("are byte-identical between web and agent repos", () => {
    const local = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "fixtures", "cell-fit-parity.json"),
      "utf8",
    );
    expect(readFileSync(AGENT_FIXTURES, "utf8")).toBe(local);
  });
});

describe("dragToPan", () => {
  it("converts a pixel drag relative to half the slack", () => {
    expect(dragToPan(50, 100)).toBe(1);
    expect(dragToPan(-25, 100)).toBe(-0.5);
  });

  it("returns 0 on an axis with no slack", () => {
    expect(dragToPan(50, 0)).toBe(0);
    expect(dragToPan(50, -10)).toBe(0);
  });
});
