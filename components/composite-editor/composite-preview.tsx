"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CompositeProduct, BorderPreset } from "@/lib/composite-products";
import { BORDER_PRESETS } from "@/lib/composite-products";
import type { CompositeEditorState } from "@/lib/composite-editor/state";
import { activeCells, activeSheet } from "@/lib/composite-editor/state";
import { coverFit, dragToPan, type CellRotation } from "@/lib/composite-editor/cell-fit";

const borderById = (id: string): BorderPreset =>
  BORDER_PRESETS.find((b) => b.id === id) ?? BORDER_PRESETS[0];

/**
 * Live preview of the composite sheet at print scale. Each cell's photo is
 * placed with the shared coverFit() math (so it always covers — no white gaps —
 * and matches what the print agent renders). Dragging the active cell pans its
 * photo within the available slack; the zoom slider scales on top of cover.
 */
export function CompositePreview({
  product,
  state,
  onSelectCell,
  onPan,
  onNatural,
}: {
  product: CompositeProduct;
  state: CompositeEditorState;
  onSelectCell: (i: number) => void;
  onPan: (i: number, x: number, y: number) => void;
  onNatural: (i: number, natW: number, natH: number) => void;
}) {
  const cells = activeCells(product, state);
  const sheet = activeSheet(product, state);

  // Measure the sheet's rendered px so cell/photo geometry is exact.
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetPxW, setSheetPxW] = useState(0);
  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const measure = () => setSheetPxW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sheetPxH = sheetPxW * (sheet.h / sheet.w);

  const dragRef = useRef<
    | { i: number; startX: number; startY: number; baseX: number; baseY: number; slackX: number; slackY: number }
    | null
  >(null);

  // Interior cut-line positions (inches) → percentages of the sheet.
  const xs = new Set<number>();
  const ys = new Set<number>();
  for (const c of cells) {
    if (c.x > 0.01) xs.add(c.x);
    if (c.x + c.width < sheet.w - 0.01) xs.add(c.x + c.width);
    if (c.y > 0.01) ys.add(c.y);
    if (c.y + c.height < sheet.h - 0.01) ys.add(c.y + c.height);
  }

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={sheetRef}
      className="relative mx-auto w-full select-none overflow-hidden rounded-lg bg-white shadow-inner ring-1 ring-ink/10"
      style={{ aspectRatio: `${sheet.w} / ${sheet.h}`, maxWidth: sheet.w >= sheet.h ? 520 : 360 }}
    >
      {cells.map((cell, i) => {
        const cs = state.cells[i];
        const border = borderById(cs.borderId);
        const active = state.activeCell === i;

        // Cell + inner (border-subtracted) box in px.
        const cellPxW = sheetPxW * (cell.width / sheet.w);
        const cellPxH = sheetPxH * (cell.height / sheet.h);
        const borderPx = border.id !== "none" ? border.widthInches * (sheetPxW / sheet.w) : 0;
        const innerW = Math.max(1, cellPxW - borderPx * 2);
        const innerH = Math.max(1, cellPxH - borderPx * 2);

        const hasPhoto = !!cs.url && !!cs.natW && !!cs.natH;
        const fit = hasPhoto
          ? coverFit({
              innerW,
              innerH,
              natW: cs.natW!,
              natH: cs.natH!,
              scale: cs.transform.scale,
              panX: cs.transform.x,
              panY: cs.transform.y,
              rotation: cs.transform.rotation as CellRotation,
            })
          : null;

        const onPointerDown = (e: React.PointerEvent) => {
          onSelectCell(i);
          if (!fit) return;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          dragRef.current = {
            i,
            startX: e.clientX,
            startY: e.clientY,
            baseX: cs.transform.x,
            baseY: cs.transform.y,
            slackX: fit.slackX,
            slackY: fit.slackY,
          };
        };
        const onPointerMove = (e: React.PointerEvent) => {
          const d = dragRef.current;
          if (!d || d.i !== i) return;
          const nx = d.baseX + dragToPan(e.clientX - d.startX, d.slackX);
          const ny = d.baseY + dragToPan(e.clientY - d.startY, d.slackY);
          onPan(i, Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
        };

        const canPan = active && fit && (fit.slackX > 1 || fit.slackY > 1);

        return (
          <div
            key={i}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`absolute touch-none ${active ? "z-10" : ""} ${canPan ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
            style={{
              left: `${(cell.x / sheet.w) * 100}%`,
              top: `${(cell.y / sheet.h) * 100}%`,
              width: `${(cell.width / sheet.w) * 100}%`,
              height: `${(cell.height / sheet.h) * 100}%`,
              background: border.id !== "none" ? border.color : "transparent",
              padding: borderPx,
            }}
          >
            <div className="relative h-full w-full overflow-hidden">
              {cs.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cs.url}
                  alt=""
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && (cs.natW !== img.naturalWidth || cs.natH !== img.naturalHeight)) {
                      onNatural(i, img.naturalWidth, img.naturalHeight);
                    }
                  }}
                  className="absolute max-w-none select-none object-cover"
                  style={
                    fit
                      ? {
                          width: `${fit.elemW}px`,
                          height: `${fit.elemH}px`,
                          left: `${fit.left}px`,
                          top: `${fit.top}px`,
                          transform: `rotate(${fit.rotation}deg)`,
                          transformOrigin: "center",
                        }
                      : { inset: 0, width: "100%", height: "100%" }
                  }
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
