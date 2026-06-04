"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/api/photos";
import type { CatalogProduct } from "@/lib/api/catalog";
import { type Orientation, orientedAspect, isSquareSize } from "@/lib/editor/sizes";
import { type Rect } from "@/lib/edit/crop-math";
import {
  type EditAdjustments,
  type FilterId,
  type Rotation,
  ZERO_ADJUSTMENTS,
  buildCssFilter,
} from "@/lib/edit/payload-schema";
import { EditorCanvas, type CropChange } from "@/components/editor/editor-canvas";

export interface SavePayloadParts {
  crop: Rect | null;
  orientation: Orientation;
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
  adjustments: EditAdjustments;
  autoEnhance: boolean;
  filterId: FilterId;
}

interface CropModalProps {
  photo: Photo;
  product: CatalogProduct;
  initialOrientation: Orientation;
  border: boolean;
  borderInches: number;
  qty: number;
  onQtyChange: (qty: number) => void;
  photoIndex: number;
  photoCount: number;
  onPrev: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSave: (parts: SavePayloadParts) => Promise<void>;
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "none", label: "Original" },
  { id: "bw", label: "B&W" },
  { id: "sepia", label: "Sepia" },
  { id: "vintage", label: "Vintage" },
];

const SLIDERS: { key: keyof EditAdjustments; label: string; min: number; max: number }[] = [
  { key: "brightness", label: "Brightness", min: -1, max: 1 },
  { key: "contrast", label: "Contrast", min: -1, max: 1 },
  { key: "saturation", label: "Saturation", min: -1, max: 1 },
  { key: "exposure", label: "Exposure", min: -2, max: 2 },
];

export function CropModal({
  photo,
  product,
  initialOrientation,
  border,
  borderInches,
  qty,
  onQtyChange,
  photoIndex,
  photoCount,
  onPrev,
  onNext,
  onCancel,
  onSave,
}: CropModalProps) {
  const [orientation, setOrientation] = useState<Orientation>(initialOrientation);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [adjustments, setAdjustments] = useState<EditAdjustments>(ZERO_ADJUSTMENTS);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [filterId, setFilterId] = useState<FilterId>("none");
  const [showEffects, setShowEffects] = useState(false);
  const [cropPixels, setCropPixels] = useState<{ width: number; height: number } | null>(null);
  const [frame, setFrame] = useState<Rect | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const cropRef = useRef<Rect | null>(null);

  const square = orientation === "square";
  const [aspectW, aspectH] = orientedAspect(product.sizeCode, orientation);
  const swap = orientation === "landscape";
  const minR = swap
    ? { w: product.minResolution.height, h: product.minResolution.width }
    : { w: product.minResolution.width, h: product.minResolution.height };
  const recR = swap
    ? { w: product.recommendedResolution.height, h: product.recommendedResolution.width }
    : { w: product.recommendedResolution.width, h: product.recommendedResolution.height };

  const minArea = product.minResolution.width * product.minResolution.height;
  const recArea = product.recommendedResolution.width * product.recommendedResolution.height;
  const cropArea = cropPixels ? cropPixels.width * cropPixels.height : null;
  const resLevel: "ok" | "warn" | "bad" =
    cropArea === null ? "ok" : cropArea < minArea ? "bad" : cropArea < recArea ? "warn" : "ok";

  const cssFilter = buildCssFilter(adjustments, filterId, autoEnhance);

  const handleCropChange = (c: CropChange) => {
    cropRef.current = c.crop;
    setCropPixels(c.pixels);
  };

  function bestFit() {
    setOrientation(isSquareSize(product.sizeCode) ? "square" : initialOrientation);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setResetKey((k) => k + 1);
  }

  async function handleSave() {
    setSaving(true);
    setErr("");
    try {
      await onSave({ crop: cropRef.current, orientation, rotation, flipH, flipV, adjustments, autoEnhance, filterId });
      // parent closes the modal on success
    } catch {
      setErr("Couldn't save. Please try again.");
      setSaving(false);
    }
  }

  const pillBtn =
    "flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-ink/15 px-4 text-xs font-medium text-ink-soft transition-colors duration-200 hover:border-ink/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-2 sm:p-4">
      <div className="flex h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
          <button type="button" onClick={onCancel} className="flex h-10 cursor-pointer items-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5">
            Cancel
          </button>
          <p className="text-sm font-semibold text-ink">{product.labelInches} print</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-10 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        {/* Canvas with L-shaped dimension labels anchored to the print frame */}
        <div className="min-h-0 flex-1 p-4">
          <div className="relative h-full w-full">
            <EditorCanvas
              key={resetKey}
              imageUrl={photo.storageUrl}
              frameAspectW={aspectW}
              frameAspectH={aspectH}
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              border={border}
              borderInches={borderInches}
              cssFilter={cssFilter}
              zoom={zoom}
              onZoomChange={setZoom}
              onCropChange={handleCropChange}
              onFrameChange={setFrame}
            />
            {frame && (
              <div
                className="pointer-events-none absolute flex items-end gap-1"
                style={{ left: frame.x + 6, top: frame.y + frame.height - 6, transform: "translateY(-100%)" }}
              >
                <div className="flex flex-col items-center rounded bg-white/85 px-1 py-1 font-mono text-[11px] text-ink">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M12 5l-5 5M12 5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{aspectH} in</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-white/85 px-1.5 py-1 font-mono text-[11px] text-ink">
                  <span>{aspectW} in</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M19 12l-5-5M19 12l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="shrink-0 space-y-2.5 bg-ink/[0.05] px-4 py-3">
          {/* Effects panel */}
          {showEffects && (
            <div className="space-y-2 rounded-xl border border-ink/10 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Effects</span>
                <button
                  type="button"
                  onClick={() => setAutoEnhance((v) => !v)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${autoEnhance ? "border-malachite bg-malachite/10 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}
                >
                  Auto-enhance {autoEnhance ? "on" : "off"}
                </button>
              </div>
              {SLIDERS.map((s) => (
                <label key={s.key} className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="w-20 shrink-0">{s.label}</span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={0.01}
                    value={adjustments[s.key]}
                    onChange={(e) => setAdjustments((a) => ({ ...a, [s.key]: Number(e.target.value) }))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-malachite"
                  />
                </label>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterId(f.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${filterId === f.id ? "border-malachite bg-malachite/10 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 1: qty · rotate · flips · orientation · prev/next */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-1.5">
              <div className="leading-none">
                <span className="text-[11px] text-ink-mute">Qty</span>
                <div className="font-mono text-base text-ink">{qty}</div>
              </div>
              <button type="button" onClick={() => onQtyChange(qty + 1)} aria-label="Increase quantity" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-malachite text-lg font-bold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream">
                +
              </button>
              <button type="button" onClick={() => onQtyChange(Math.max(0, qty - 1))} aria-label="Decrease quantity" disabled={qty <= 0} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-malachite text-lg font-bold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-40">
                −
              </button>
            </div>

            <button type="button" onClick={() => setRotation((r) => ((r + 90) % 360) as Rotation)} className={pillBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Rotate
            </button>
            <button type="button" onClick={() => setFlipH((v) => !v)} className={pillBtn} aria-pressed={flipH}>
              ⇆ Flip
            </button>
            <button type="button" onClick={() => setFlipV((v) => !v)} className={pillBtn} aria-pressed={flipV}>
              ⇅ Flip
            </button>

            {!square && (
              <button type="button" onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))} className={pillBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="7" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Orientation
              </button>
            )}

            {photoCount > 1 && (
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={onPrev} aria-label="Previous photo" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-200 hover:border-ink/30">
                  ‹
                </button>
                <span className="font-mono text-xs text-ink-mute">{photoIndex + 1}/{photoCount}</span>
                <button type="button" onClick={onNext} aria-label="Next photo" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-200 hover:border-ink/30">
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Row 2: best fit · zoom · effects · add text */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={bestFit} className={pillBtn}>
              Best fit
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2">
              <span className="text-ink-mute" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4-4M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input type="range" min={1} max={5} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/15 accent-malachite" />
            </div>
            <button
              type="button"
              onClick={() => setShowEffects((v) => !v)}
              className={`flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border px-4 text-xs font-medium transition-colors duration-200 ${showEffects ? "border-malachite bg-malachite/10 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}
            >
              Effects
            </button>
            <span className="flex min-h-[44px] cursor-not-allowed flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-ink/15 px-4 text-xs font-medium text-ink-mute" title="Coming soon">
              Add text<span className="rounded bg-ink/8 px-1 text-[9px]">soon</span>
            </span>
          </div>

          {/* Minimum / Recommended */}
          <div className="flex items-center justify-center gap-10 pt-0.5 text-center">
            <div>
              <p className="text-[11px] text-ink-mute">Minimum</p>
              <p className={`font-mono text-xs ${resLevel === "bad" ? "text-coral" : "text-ink"}`}>{minR.w} × {minR.h}px</p>
            </div>
            <div>
              <p className="text-[11px] text-ink-mute">Recommended</p>
              <p className={`font-mono text-xs ${resLevel === "warn" ? "text-amber" : "text-ink"}`}>{recR.w} × {recR.h}px</p>
            </div>
          </div>

          {err && <p className="text-center text-xs text-coral">{err}</p>}
        </div>
      </div>
    </div>
  );
}
