"use client";

import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import {
  type Rect,
  clamp,
  coverScale,
  fitFrame,
  clampImagePos,
  computeNormalizedCrop,
  croppedPixels,
} from "@/lib/edit/crop-math";

// Gap between the crop frame and the stage edge → the photo outside the frame
// shows as a dimmed "bleed" guide.
const PAD = 24;

export interface CropChange {
  crop: Rect; // normalized [0,1] of the rotated+flipped image
  pixels: { width: number; height: number };
}

interface EditorCanvasProps {
  imageUrl: string;
  frameAspectW: number;
  frameAspectH: number;
  rotation?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
  /** border on → guide shows as a solid white print border; off → grey guide. */
  border?: boolean;
  /** Border/guide thickness in inches (0 = the size offers no border → no guide). */
  borderInches?: number;
  /** CSS filter string for the live colour preview (approximate; server is exact). */
  cssFilter?: string;
  zoom: number;
  onZoomChange: (z: number) => void;
  onCropChange?: (c: CropChange) => void;
  maxZoom?: number;
}

type SourceImage = HTMLImageElement | HTMLCanvasElement;

/**
 * Pre-bake rotation + flips into a canvas so all crop math stays axis-aligned
 * and matches the server (which applies rotate → flip → crop in that order).
 */
function buildSource(img: HTMLImageElement, rotation: number, flipH: boolean, flipV: boolean): SourceImage {
  if (rotation % 360 === 0 && !flipH && !flipV) return img;
  const swap = rotation === 90 || rotation === 270;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  // Order matters: scale (flip) is applied AFTER rotate to the drawn pixels,
  // matching the server's rotate-then-flip sequence.
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2);
  return canvas;
}

function sourceSize(src: SourceImage, img: HTMLImageElement): { w: number; h: number } {
  return src instanceof HTMLCanvasElement
    ? { w: src.width, h: src.height }
    : { w: img.naturalWidth, h: img.naturalHeight };
}

function centerOf(r: Rect): { x: number; y: number } {
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

/**
 * Phase 2.2 crop canvas. A frame locked to the print aspect stays fixed; the
 * photo pans/zooms behind it, always covering it, with the cropped-out area
 * dimmed. Supports 90° rotation + flips and a live CSS colour filter. Reports
 * the live crop as normalized coords. Konva loads dynamically (SSR-safe).
 */
export function EditorCanvas({
  imageUrl,
  frameAspectW,
  frameAspectH,
  rotation = 0,
  flipH = false,
  flipV = false,
  border = false,
  borderInches = 0,
  cssFilter,
  zoom,
  onZoomChange,
  onCropChange,
  maxZoom = 5,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const onCropChangeRef = useRef(onCropChange);
  const onZoomChangeRef = useRef(onZoomChange);
  const aspectRef = useRef({ w: frameAspectW, h: frameAspectH });
  const transformRef = useRef({ rotation, flipH, flipV });
  const borderRef = useRef(border);
  const borderInchesRef = useRef(borderInches);
  const maxZoomRef = useRef(maxZoom);

  useEffect(() => {
    onCropChangeRef.current = onCropChange;
  }, [onCropChange]);
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);
  useEffect(() => {
    maxZoomRef.current = maxZoom;
  }, [maxZoom]);

  const ctrlRef = useRef<{
    stage: Konva.Stage;
    natW: number;
    natH: number;
    frame: Rect;
    baseScale: number;
    zoom: number;
    pos: { x: number; y: number };
    setTransform: (rotation: number, flipH: boolean, flipV: boolean) => void;
    reframe: () => void;
    applyZoom: (z: number) => void;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;
    const imageObj = new window.Image();

    (async () => {
      const Konva = (await import("konva/lib/index.js")).default;
      if (destroyed || !el) return;

      const stage = new Konva.Stage({ container: el, width: el.clientWidth, height: el.clientHeight });
      const layer = new Konva.Layer();
      stage.add(layer);

      imageObj.onerror = () => {
        if (!destroyed) setStatus("error");
      };
      imageObj.onload = () => {
        if (destroyed) return;

        const t = transformRef.current;
        let src = buildSource(imageObj, t.rotation, t.flipH, t.flipV);
        let sz = sourceSize(src, imageObj);

        const image = new Konva.Image({ image: src, draggable: true });
        const mask = [0, 1, 2, 3].map(
          () => new Konva.Rect({ fill: "#1F1B16", opacity: 0.5, listening: false }),
        );
        const frameBorder = new Konva.Rect({ stroke: "#FBF7F0", strokeWidth: 1.5, listening: false });
        const grid = [0, 1, 2, 3].map(
          () => new Konva.Line({ stroke: "#FBF7F0", strokeWidth: 1, opacity: 0.35, listening: false }),
        );
        // ¼" margin guide (grey, translucent) — becomes a solid white border when on.
        const guide = [0, 1, 2, 3].map(() => new Konva.Rect({ listening: false }));
        layer.add(image);
        mask.forEach((m) => layer.add(m));
        layer.add(frameBorder);
        grid.forEach((g) => layer.add(g));
        guide.forEach((g) => layer.add(g));

        const ctrl = {
          stage,
          natW: sz.w,
          natH: sz.h,
          frame: { x: 0, y: 0, width: 0, height: 0 } as Rect,
          baseScale: 1,
          zoom: 1,
          pos: { x: 0, y: 0 },
          imageRect(): Rect {
            const ds = this.baseScale * this.zoom;
            return { x: this.pos.x, y: this.pos.y, width: this.natW * ds, height: this.natH * ds };
          },
          setTransform(rotation: number, fH: boolean, fV: boolean) {
            src = buildSource(imageObj, rotation, fH, fV);
            sz = sourceSize(src, imageObj);
            this.natW = sz.w;
            this.natH = sz.h;
            image.image(src);
            this.reframe();
          },
          reframe() {
            const sw = el.clientWidth;
            const sh = el.clientHeight;
            if (sw === 0 || sh === 0) return;
            stage.size({ width: sw, height: sh });
            const prev = this.frame.width
              ? centerOf(computeNormalizedCrop(this.frame, this.imageRect()))
              : { x: 0.5, y: 0.5 };
            this.frame = fitFrame(sw, sh, aspectRef.current.w, aspectRef.current.h, PAD);
            this.baseScale = coverScale(this.natW, this.natH, this.frame.width, this.frame.height);
            this.setCentre(prev);
            this.paintOverlay();
          },
          setCentre(c: { x: number; y: number }) {
            const r = this.imageRect();
            const fcx = this.frame.x + this.frame.width / 2;
            const fcy = this.frame.y + this.frame.height / 2;
            this.pos = clampImagePos(
              { x: fcx - c.x * r.width, y: fcy - c.y * r.height },
              { width: r.width, height: r.height },
              this.frame,
            );
            this.applyImage();
          },
          applyImage() {
            const r = this.imageRect();
            image.setAttrs({ x: r.x, y: r.y, width: r.width, height: r.height });
            this.emit();
            stage.batchDraw();
          },
          applyZoom(z: number) {
            const c = this.frame.width
              ? centerOf(computeNormalizedCrop(this.frame, this.imageRect()))
              : { x: 0.5, y: 0.5 };
            this.zoom = clamp(z, 1, maxZoomRef.current);
            this.setCentre(c);
            this.paintOverlay();
          },
          paintOverlay() {
            const f = this.frame;
            const sw = stage.width();
            const sh = stage.height();
            mask[0].setAttrs({ x: 0, y: 0, width: sw, height: f.y });
            mask[1].setAttrs({ x: 0, y: f.y + f.height, width: sw, height: sh - (f.y + f.height) });
            mask[2].setAttrs({ x: 0, y: f.y, width: f.x, height: f.height });
            mask[3].setAttrs({ x: f.x + f.width, y: f.y, width: sw - (f.x + f.width), height: f.height });
            frameBorder.setAttrs({ x: f.x, y: f.y, width: f.width, height: f.height });
            const tx = f.width / 3;
            const ty = f.height / 3;
            grid[0].points([f.x + tx, f.y, f.x + tx, f.y + f.height]);
            grid[1].points([f.x + 2 * tx, f.y, f.x + 2 * tx, f.y + f.height]);
            grid[2].points([f.x, f.y + ty, f.x + f.width, f.y + ty]);
            grid[3].points([f.x, f.y + 2 * ty, f.x + f.width, f.y + 2 * ty]);
            // ¼" margin guide: 4 inset bands. Grey + translucent normally; solid
            // white when the ¼" border is on (the print's white border).
            const bi = borderInchesRef.current;
            const insetX = (bi / aspectRef.current.w) * f.width;
            const insetY = (bi / aspectRef.current.h) * f.height;
            const on = borderRef.current;
            const gFill = on ? "#FFFFFF" : "#6b7280";
            const gOpacity = bi <= 0 ? 0 : on ? 1 : 0.4;
            const setG = (i: number, x: number, y: number, w: number, h: number) =>
              guide[i].setAttrs({ x, y, width: Math.max(0, w), height: Math.max(0, h), fill: gFill, opacity: gOpacity });
            setG(0, f.x, f.y, f.width, insetY);
            setG(1, f.x, f.y + f.height - insetY, f.width, insetY);
            setG(2, f.x, f.y + insetY, insetX, f.height - 2 * insetY);
            setG(3, f.x + f.width - insetX, f.y + insetY, insetX, f.height - 2 * insetY);
            stage.batchDraw();
          },
          emit() {
            const crop = computeNormalizedCrop(this.frame, this.imageRect());
            onCropChangeRef.current?.({ crop, pixels: croppedPixels(crop, this.natW, this.natH) });
          },
        };

        image.dragBoundFunc((p) => {
          const r = ctrl.imageRect();
          return clampImagePos(p, { width: r.width, height: r.height }, ctrl.frame);
        });
        image.on("dragmove", () => {
          ctrl.pos = { x: image.x(), y: image.y() };
          ctrl.emit();
        });
        stage.on("wheel", (e) => {
          e.evt.preventDefault();
          const factor = e.evt.deltaY > 0 ? 0.92 : 1.08;
          onZoomChangeRef.current(clamp(ctrl.zoom * factor, 1, maxZoomRef.current));
        });

        ctrlRef.current = ctrl;
        ctrl.reframe();
        setStatus("ready");

        resizeObserver = new ResizeObserver(() => ctrl.reframe());
        resizeObserver.observe(el);
      };
      imageObj.src = imageUrl;
    })();

    return () => {
      destroyed = true;
      imageObj.onload = null;
      imageObj.onerror = null;
      if (resizeObserver) resizeObserver.disconnect();
      ctrlRef.current?.stage.destroy();
      ctrlRef.current = null;
    };
  }, [imageUrl]);

  useEffect(() => {
    transformRef.current = { rotation, flipH, flipV };
    ctrlRef.current?.setTransform(rotation, flipH, flipV);
  }, [rotation, flipH, flipV]);

  useEffect(() => {
    aspectRef.current = { w: frameAspectW, h: frameAspectH };
    ctrlRef.current?.reframe();
  }, [frameAspectW, frameAspectH]);

  useEffect(() => {
    borderRef.current = border;
    borderInchesRef.current = borderInches;
    ctrlRef.current?.reframe();
  }, [border, borderInches]);

  useEffect(() => {
    const c = ctrlRef.current;
    if (c && c.zoom !== zoom) c.applyZoom(zoom);
  }, [zoom]);

  return (
    <div className="relative h-full w-full touch-none overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" style={{ filter: cssFilter }} />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <p className="text-sm text-coral">Couldn&rsquo;t load this photo. Try again.</p>
        </div>
      )}
    </div>
  );
}
