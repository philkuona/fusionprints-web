/**
 * Composite editor state (Wallet / Passport / Mini).
 *
 * One object owned by the editor route via useReducer (same pattern as the
 * photo editor — no Zustand). Serialises 1:1 to the cart's composite layout
 * payload at "Add to cart".
 */

import type { CompositeProduct, CompositeCell } from "@/lib/composite-products";

export interface CellTransform {
  /**
   * Slack-relative pan ∈ [-1, 1]: 0 = centred, ±1 = photo edge flush with the
   * cell edge. Aspect-independent, so it never reveals background. See coverFit.
   */
  x: number;
  y: number;
  /** Zoom multiplier on top of cover-fit (1 = cover, >1 zoomed in). */
  scale: number;
  /** Discrete rotation in degrees. */
  rotation: 0 | 90 | 180 | 270;
}

export interface CellState {
  /** Uploaded image id (processed/source) once a photo is placed. */
  imageId: string | null;
  /** Preview URL for the canvas + thumbnails. */
  url: string | null;
  /** Natural source pixel dims — needed for cover-fit/pan math (null until known). */
  natW: number | null;
  natH: number | null;
  transform: CellTransform;
  borderId: string;
  /** Transient: a local upload is in flight. */
  uploading: boolean;
}

export interface CompositeEditorState {
  productCode: string;
  /** Active orientation (mini only swaps this; others stay 'default'). */
  orientation: "default" | "portrait";
  cells: CellState[];
  activeCell: number;
}

export const IDENTITY_TRANSFORM: CellTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

/**
 * Which photo slot fills a given print cell. uniquePhotos === 1 → one photo is
 * duplicated across every cell (wallet/passport); otherwise photos map 1:1 to
 * cells in order (mini). State is keyed by photo SLOT (uniquePhotos), not by
 * cell, so the customer only ever provides as many photos as the product needs.
 */
export function slotForCell(product: CompositeProduct, cellIndex: number): number {
  return product.uniquePhotos === 1 ? 0 : cellIndex;
}

export function initEditor(product: CompositeProduct): CompositeEditorState {
  const slotCount = product.uniquePhotos;
  return {
    productCode: product.sizeCode,
    orientation: "default",
    cells: Array.from({ length: slotCount }, () => ({
      imageId: null,
      url: null,
      natW: null,
      natH: null,
      transform: { ...IDENTITY_TRANSFORM },
      borderId: product.editor.defaultBorder,
      uploading: false,
    })),
    activeCell: 0,
  };
}

export type EditorAction =
  | { type: "selectCell"; index: number }
  | { type: "uploadStart"; index: number }
  | { type: "uploadDone"; index: number; imageId: string; url: string; natW?: number | null; natH?: number | null }
  | { type: "uploadFail"; index: number }
  | { type: "setNatural"; index: number; natW: number; natH: number }
  | { type: "fillAll"; imageId: string; url: string; natW?: number | null; natH?: number | null }
  | { type: "setTransform"; index: number; transform: Partial<CellTransform> }
  | { type: "rotateCell"; index: number; dir: 1 | -1 }
  | { type: "resetCell"; index: number }
  | { type: "setBorder"; index: number; borderId: string }
  | { type: "applyBorderToAll"; borderId: string }
  | { type: "setOrientation"; orientation: "default" | "portrait" };

export function editorReducer(state: CompositeEditorState, action: EditorAction): CompositeEditorState {
  const cells = state.cells;
  const patchCell = (i: number, patch: Partial<CellState>): CellState[] =>
    cells.map((c, idx) => (idx === i ? { ...c, ...patch } : c));

  switch (action.type) {
    case "selectCell":
      return { ...state, activeCell: action.index };
    case "uploadStart":
      return { ...state, cells: patchCell(action.index, { uploading: true }) };
    case "uploadDone":
      return {
        ...state,
        cells: patchCell(action.index, {
          imageId: action.imageId,
          url: action.url,
          natW: action.natW ?? null,
          natH: action.natH ?? null,
          transform: { ...IDENTITY_TRANSFORM }, // fresh photo → centred cover
          uploading: false,
        }),
      };
    case "uploadFail":
      return { ...state, cells: patchCell(action.index, { uploading: false }) };
    case "setNatural":
      return { ...state, cells: patchCell(action.index, { natW: action.natW, natH: action.natH }) };
    case "fillAll":
      return {
        ...state,
        cells: cells.map((c) => ({
          ...c,
          imageId: action.imageId,
          url: action.url,
          natW: action.natW ?? null,
          natH: action.natH ?? null,
          transform: { ...IDENTITY_TRANSFORM },
          uploading: false,
        })),
      };
    case "setTransform": {
      const t = { ...cells[action.index].transform, ...action.transform };
      // Keep pan slack-relative and zoom >= cover.
      t.x = Math.max(-1, Math.min(1, t.x));
      t.y = Math.max(-1, Math.min(1, t.y));
      t.scale = Math.max(1, t.scale);
      return { ...state, cells: patchCell(action.index, { transform: t }) };
    }
    case "rotateCell": {
      const cur = cells[action.index].transform.rotation;
      const next = (((cur + action.dir * 90) % 360) + 360) % 360 as 0 | 90 | 180 | 270;
      return { ...state, cells: patchCell(action.index, { transform: { ...cells[action.index].transform, rotation: next } }) };
    }
    case "resetCell":
      return { ...state, cells: patchCell(action.index, { transform: { ...IDENTITY_TRANSFORM } }) };
    case "setBorder":
      return { ...state, cells: patchCell(action.index, { borderId: action.borderId }) };
    case "applyBorderToAll":
      return { ...state, cells: cells.map((c) => ({ ...c, borderId: action.borderId })) };
    case "setOrientation":
      // Cell aspect flips with orientation, so recentre the pan (keep zoom/rotation)
      // — the old framing would otherwise jump to an unrelated region.
      return {
        ...state,
        orientation: action.orientation,
        cells: cells.map((c) => ({ ...c, transform: { ...c.transform, x: 0, y: 0 } })),
      };
    default:
      return state;
  }
}

/** All cells have a photo → ready to order. */
export function isComplete(state: CompositeEditorState): boolean {
  return state.cells.every((c) => !!c.imageId);
}

/** Cells for the active orientation (mini portrait re-flows; others fixed). */
export function activeCells(product: CompositeProduct, state: CompositeEditorState): CompositeCell[] {
  if (state.orientation === "portrait" && product.portraitLayout) {
    return product.portraitLayout.cells;
  }
  return product.layout.cells;
}

/** Sheet dims (inches) for the active orientation. */
export function activeSheet(product: CompositeProduct, state: CompositeEditorState): { w: number; h: number } {
  if (state.orientation === "portrait" && product.portraitLayout) {
    return { w: product.portraitLayout.sheetWidth, h: product.portraitLayout.sheetHeight };
  }
  return { w: product.layout.sheetWidth, h: product.layout.sheetHeight };
}

/**
 * Serialise to the cart/order layout payload. Expands the per-slot state out to
 * one entry per PRINT CELL (wallet → 4 cells from 1 slot; mini → 2 cells from 2
 * slots), which is the shape the backend + print agent consume.
 */
export function toLayoutPayload(product: CompositeProduct, state: CompositeEditorState) {
  const cells = activeCells(product, state);
  return {
    orientation: state.orientation,
    cells: cells.map((_, cellIndex) => {
      const c = state.cells[slotForCell(product, cellIndex)];
      return {
        cellIndex,
        imageId: c.imageId,
        transform: c.transform,
        border: c.borderId === "none" ? null : c.borderId,
      };
    }),
  };
}
