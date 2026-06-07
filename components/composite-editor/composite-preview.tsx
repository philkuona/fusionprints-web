"use client";

import { useRef } from "react";
import type { CompositeProduct, BorderPreset } from "@/lib/composite-products";
import { BORDER_PRESETS } from "@/lib/composite-products";
import type { CompositeEditorState } from "@/lib/composite-editor/state";
import { activeCells, activeSheet } from "@/lib/composite-editor/state";

const borderById = (id: string): BorderPreset =>
  BORDER_PRESETS.find((b) => b.id === id) ?? BORDER_PRESETS[0];

/**
 * Live preview of the composite sheet at print scale — positioned cells with
 * cover-fit photos (CSS transform = pan/zoom/rotate), per-cell borders, and
 * always-on dashed cut guides. Dragging the active cell pans its photo.
 */
export function CompositePreview({
  product,
  state,
  onSelectCell,
  onPan,
}: {
  product: CompositeProduct;
  state: CompositeEditorState;
  onSelectCell: (i: number) => void;
  onPan: (i: number, x: number, y: number) => void;
}) {
  const cells = activeCells(product, state);
  const sheet = activeSheet(product, state);
  const dragRef = useRef<{ i: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // Interior cut-line positions (inches) → percentages of the sheet.
  const xs = new Set<number>();
  const ys = new Set<number>();
  for (const c of cells) {
    if (c.x > 0.01) xs.add(c.x);
    if (c.x + c.width < sheet.w - 0.01) xs.add(c.x + c.width);
    if (c.y > 0.01) ys.add(c.y);
    if (c.y + c.height < sheet.h - 0.01) ys.add(c.y + c.height);
  }

  const onPointerDown = (e: React.PointerEvent, i: number) => {
    onSelectCell(i);
    if (!state.cells[i].imageId) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      i,
      startX: e.clientX,
      startY: e.clientY,
      baseX: state.cells[i].transform.x,
      baseY: state.cells[i].transform.y,
    };
  };
  const onPointerMove = (e: React.PointerEvent, cellPxW: number, cellPxH: number) => {
    const d = dragRef.current;
    if (!d) return;
    // Convert pixel drag to cell-fraction pan, clamp to a sane range.
    const nx = Math.max(-0.5, Math.min(0.5, d.baseX + (e.clientX - d.startX) / cellPxW));
    const ny = Math.max(-0.5, Math.min(0.5, d.baseY + (e.clientY - d.startY) / cellPxH));
    onPan(d.i, nx, ny);
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-lg bg-white shadow-inner ring-1 ring-ink/10"
      style={{ aspectRatio: `${sheet.w} / ${sheet.h}`, maxWidth: sheet.w >= sheet.h ? 520 : 360 }}
    >
      {cells.map((cell, i) => {
        const cs = state.cells[i];
        const border = borderById(cs.borderId);
        const borderPct = (border.widthInches / Math.min(cell.width, cell.height)) * 100;
        const active = state.activeCell === i;
        return (
          <div
            key={i}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={(e) => {
              const el = e.currentTarget;
              onPointerMove(e, el.clientWidth, el.clientHeight);
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`absolute cursor-pointer touch-none ${active ? "z-10" : ""}`}
            style={{
              left: `${(cell.x / sheet.w) * 100}%`,
              top: `${(cell.y / sheet.h) * 100}%`,
              width: `${(cell.width / sheet.w) * 100}%`,
              height: `${(cell.height / sheet.h) * 100}%`,
              background: border.id !== "none" ? border.color : "transparent",
              padding: border.id !== "none" ? `${borderPct}%` : 0,
            }}
          >
            <div className="relative h-full w-full overflow-hidden">
              {cs.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cs.url}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  style={{
                    transform: `translate(${cs.transform.x * 100}%, ${cs.transform.y * 100}%) scale(${cs.transform.scale}) rotate(${cs.transform.rotation}deg)`,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center whitespace-pre-line bg-ink/5 text-center text-[11px] font-medium text-ink-mute">
                  {cs.uploading ? "Uploading…" : `Tap to add\nphoto ${i + 1}`}
                </div>
              )}
            </div>
            {/* Selection highlight — inset, so it never sits on the cut line. */}
            {active && <div className="pointer-events-none absolute inset-0 z-10 ring-2 ring-inset ring-malachite" />}
          </div>
        );
      })}

      {/* Always-on dashed cut guides — above the cells (incl. the active ring) */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {[...xs].map((x) => (
          <div
            key={`x${x}`}
            className="absolute top-0 h-full border-l border-dashed border-[#888888]/60"
            style={{ left: `${(x / sheet.w) * 100}%` }}
          />
        ))}
        {[...ys].map((y) => (
          <div
            key={`y${y}`}
            className="absolute left-0 w-full border-t border-dashed border-[#888888]/60"
            style={{ top: `${(y / sheet.h) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
