/**
 * Composite editor state (Wallet / Passport / Mini).
 *
 * One object owned by the editor route via useReducer (same pattern as the
 * photo editor — no Zustand). Serialises 1:1 to the cart's composite layout
 * payload at "Add to cart".
 */

import type { CompositeProduct, CompositeCell } from "@/lib/composite-products";

export interface CellTransform {
  /** Pan offset within the cell, in cell-fraction units (-1..1 ≈ edge to edge). */
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

export function initEditor(product: CompositeProduct): CompositeEditorState {
  const cellCount = product.layout.cells.length;
  return {
    productCode: product.sizeCode,
    orientation: "default",
    cells: Array.from({ length: cellCount }, () => ({
      imageId: null,
      url: null,
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
  | { type: "uploadDone"; index: number; imageId: string; url: string }
  | { type: "uploadFail"; index: number }
  | { type: "fillAll"; imageId: string; url: string }
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
        cells: patchCell(action.index, { imageId: action.imageId, url: action.url, uploading: false }),
      };
    case "uploadFail":
      return { ...state, cells: patchCell(action.index, { uploading: false }) };
    case "fillAll":
      return {
        ...state,
        cells: cells.map((c) => ({ ...c, imageId: action.imageId, url: action.url, uploading: false })),
      };
    case "setTransform":
      return {
        ...state,
        cells: patchCell(action.index, {
          transform: { ...cells[action.index].transform, ...action.transform },
        }),
      };
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
      return { ...state, orientation: action.orientation };
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

/** Serialise to the cart/order layout payload. */
export function toLayoutPayload(state: CompositeEditorState) {
  return {
    orientation: state.orientation,
    cells: state.cells.map((c, i) => ({
      cellIndex: i,
      imageId: c.imageId,
      transform: c.transform,
      border: c.borderId === "none" ? null : c.borderId,
    })),
  };
}
