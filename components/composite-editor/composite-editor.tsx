"use client";

import { useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto, getPhotos, type Photo } from "@/lib/api/photos";
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
  const [library, setLibrary] = useState<Photo[] | null>(null); // null = closed
  const [libraryLoading, setLibraryLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const active = state.cells[state.activeCell];
  const multiCell = state.cells.length > 1;

  const pickPhoto = () => fileRef.current?.click();

  async function openLibrary() {
    setError(null);
    setLibrary([]);
    setLibraryLoading(true);
    try {
      setLibrary(await getPhotos());
    } catch {
      setLibrary(null);
      setError("Couldn't load your photos. Make sure you're signed in.");
    } finally {
      setLibraryLoading(false);
    }
  }

  function chooseFromLibrary(photo: Photo) {
    dispatch({
      type: "uploadDone",
      index: state.activeCell,
      imageId: photo.id,
      url: photo.storageUrl,
      natW: photo.widthPx,
      natH: photo.heightPx,
    });
    setLibrary(null);
  }

  async function onFile(file: File) {
    const i = state.activeCell;
    setError(null);
    dispatch({ type: "uploadStart", index: i });
    try {
      const up = await uploadPhoto(file);
      dispatch({ type: "uploadDone", index: i, imageId: up.id, url: up.storageUrl, natW: up.widthPx, natH: up.heightPx });
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
          onNatural={(i, natW, natH) => dispatch({ type: "setNatural", index: i, natW, natH })}
        />
        <p className="text-center text-xs text-ink-mute">
          {active.url
            ? "Drag the photo to position it, and zoom to fill the cell. Dashed lines show where to cut."
            : "Faint dashed lines show where to cut. Tap a cell to choose its photo."}
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

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={pickPhoto}
            className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            {active.url ? `Replace photo ${state.activeCell + 1}` : `Add photo ${state.activeCell + 1}`}
          </button>
          <button
            type="button"
            onClick={openLibrary}
            className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-ink/20 px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40 hover:bg-ink/5"
          >
            Choose from My Photos
          </button>
        </div>

        {/* Fill-all shortcut — put the active cell's photo in every cell. */}
        {multiCell && active.url && (
          <button
            type="button"
            onClick={() => dispatch({ type: "fillAll", imageId: active.imageId!, url: active.url!, natW: active.natW, natH: active.natH })}
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

      {/* My Photos picker */}
      {library !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-6"
          onClick={() => setLibrary(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-cream p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-fraunces text-lg font-bold text-ink">
                Choose a photo for {multiCell ? `cell ${state.activeCell + 1}` : "your prints"}
              </h3>
              <button type="button" onClick={() => setLibrary(null)} aria-label="Close" className="cursor-pointer text-ink-mute hover:text-ink">✕</button>
            </div>
            {libraryLoading ? (
              <p className="py-10 text-center text-sm text-ink-mute">Loading your photos…</p>
            ) : library.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-mute">
                No photos in your library yet. Use “{active.url ? "Replace" : "Add"} photo” to upload one.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {library.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => chooseFromLibrary(p)}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg ring-1 ring-ink/10 transition-shadow hover:ring-2 hover:ring-malachite"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.storageUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
