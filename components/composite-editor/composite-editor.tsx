"use client";

import { useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "@/lib/api/photos";
import { addToCart } from "@/lib/cart";
import { BORDER_PRESETS, type CompositeProduct } from "@/lib/composite-products";
import {
  editorReducer,
  initEditor,
  isComplete,
  toLayoutPayload,
} from "@/lib/composite-editor/state";
import { CompositePreview } from "./composite-preview";

export function CompositeEditor({ product }: { product: CompositeProduct }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(editorReducer, product, initEditor);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const active = state.cells[state.activeCell];
  const multiCell = state.cells.length > 1;

  const pickPhoto = () => fileRef.current?.click();

  async function onFile(file: File) {
    const i = state.activeCell;
    setError(null);
    dispatch({ type: "uploadStart", index: i });
    try {
      const up = await uploadPhoto(file);
      dispatch({ type: "uploadDone", index: i, imageId: up.id, url: up.storageUrl });
    } catch {
      dispatch({ type: "uploadFail", index: i });
      setError("Couldn't upload that photo. Make sure you're signed in and try again.");
    }
  }

  function handleAddToCart() {
    if (!isComplete(state)) {
      setError("Add a photo to every cell first.");
      return;
    }
    setAdding(true);
    const id = `composite:${product.sizeCode}:${Date.now()}`;
    addToCart([
      {
        id,
        photoId: state.cells[0].imageId!,
        storageUrl: state.cells[0].url ?? "",
        sizeCode: product.sizeCode,
        label: product.displayName,
        qty: 1,
        unitPriceUsd: product.priceUsd,
        productType: "composite",
        layoutPayload: toLayoutPayload(state),
      },
    ]);
    router.push("/cart");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <CompositePreview
          product={product}
          state={state}
          onSelectCell={(i) => dispatch({ type: "selectCell", index: i })}
          onPan={(i, x, y) => dispatch({ type: "setTransform", index: i, transform: { x, y } })}
        />
        <p className="text-center text-xs text-ink-mute">
          Faint dashed lines show where to cut. Tap a cell to choose its photo.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />

        {multiCell && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">Cells</p>
            <div className="flex flex-wrap gap-2">
              {state.cells.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => dispatch({ type: "selectCell", index: i })}
                  className={`flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg border text-sm font-semibold transition-colors duration-200 ${state.activeCell === i ? "border-malachite ring-2 ring-malachite/40" : "border-ink/15 text-ink-mute hover:border-ink/30"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.url ? <img src={c.url} alt="" className="h-full w-full object-cover" /> : i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={pickPhoto}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          {active.url ? `Replace photo ${state.activeCell + 1}` : `Add photo ${state.activeCell + 1}`}
        </button>

        {/* Fill-all shortcut — put the active cell's photo in every cell. */}
        {multiCell && active.url && (
          <button
            type="button"
            onClick={() => dispatch({ type: "fillAll", imageId: active.imageId!, url: active.url! })}
            className="-mt-2 cursor-pointer text-xs font-semibold text-malachite-deep hover:underline"
          >
            Use this photo for all cells
          </button>
        )}

        {/* Per-cell transform */}
        {active.url && (
          <div className="space-y-3 rounded-xl border border-ink/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Adjust this cell</p>
            <label className="block text-sm text-ink-soft">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={active.transform.scale}
                onChange={(e) => dispatch({ type: "setTransform", index: state.activeCell, transform: { scale: parseFloat(e.target.value) } })}
                className="mt-1 w-full cursor-pointer accent-malachite"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => dispatch({ type: "rotateCell", index: state.activeCell, dir: -1 })} className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-ink/15 text-sm text-ink transition-colors duration-200 hover:bg-ink/5">⟲ 90°</button>
              <button type="button" onClick={() => dispatch({ type: "rotateCell", index: state.activeCell, dir: 1 })} className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-ink/15 text-sm text-ink transition-colors duration-200 hover:bg-ink/5">⟳ 90°</button>
              <button type="button" onClick={() => dispatch({ type: "resetCell", index: state.activeCell })} className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-ink/15 text-sm text-ink transition-colors duration-200 hover:bg-ink/5">Reset</button>
            </div>
          </div>
        )}

        {/* Borders */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Border</p>
          <div className="flex flex-wrap gap-2">
            {BORDER_PRESETS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => dispatch({ type: "setBorder", index: state.activeCell, borderId: b.id })}
                title={b.label}
                className={`h-9 cursor-pointer rounded-lg border px-3 text-xs font-medium transition-colors duration-200 ${active.borderId === b.id ? "border-malachite ring-2 ring-malachite/40 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => dispatch({ type: "applyBorderToAll", borderId: active.borderId })} className="cursor-pointer text-xs font-semibold text-malachite-deep hover:underline">
            Apply border to all cells
          </button>
        </div>

        {/* Mini orientation toggle */}
        {product.portraitLayout && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Layout</p>
            <div className="flex gap-2">
              {(["default", "portrait"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => dispatch({ type: "setOrientation", orientation: o })}
                  className={`h-9 flex-1 cursor-pointer rounded-lg border text-xs font-semibold transition-colors duration-200 ${state.orientation === o ? "border-malachite ring-2 ring-malachite/40 text-ink" : "border-ink/15 text-ink-soft hover:border-ink/30"}`}
                >
                  {o === "default" ? "Side by side" : "Stacked"}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
        >
          Add to cart · ${product.priceUsd.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
