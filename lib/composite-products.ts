/**
 * Web-side composite product config (Wallet / Passport / Mini).
 *
 * Mirrors the backend catalog's composite layouts (the source of truth is
 * FusionPrints_Composite_Schema.ts) so the editor can render cells/cut-lines at
 * print scale without a backend round-trip. Prices are display defaults; the
 * order is always priced server-side at checkout.
 */

export interface CompositeCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompositeLayout {
  sheetWidth: number; // inches
  sheetHeight: number;
  printRotation: 0 | 90;
  cells: CompositeCell[];
}

export interface BorderPreset {
  id: string;
  label: string;
  widthInches: number;
  color: string; // hex, or 'transparent'
}

export interface CompositeProduct {
  sizeCode: string;
  slug: "wallet" | "mini" | "passport";
  displayName: string;
  tagline: string;
  description: string;
  priceUsd: number;
  /** How many photos the customer provides (mini = 2 unique; others 1 → fill-all). */
  uniquePhotos: number;
  layout: CompositeLayout;
  /** Mini only — the portrait orientation toggle. */
  portraitLayout?: CompositeLayout;
  editor: { defaultBorder: string };
}

export const BORDER_PRESETS: BorderPreset[] = [
  { id: "none", label: "None", widthInches: 0, color: "transparent" },
  { id: "white_thin", label: "Thin white", widthInches: 0.05, color: "#FBF7F0" },
  { id: "white_thick", label: "Polaroid", widthInches: 0.2, color: "#FBF7F0" },
  { id: "black_thin", label: "Thin black", widthInches: 0.05, color: "#1F1B16" },
  { id: "vintage", label: "Vintage cream", widthInches: 0.12, color: "#E8DBC0" },
];

export const COMPOSITE_PRODUCTS: Record<string, CompositeProduct> = {
  wallet: {
    sizeCode: "wallet_4up",
    slug: "wallet",
    displayName: "Wallet Prints",
    tagline: "Four keepsakes from one photo.",
    description:
      "Four classic 2×3 wallet prints on a single 4×6 sheet. Cut along the guides for four little keepsakes to carry, frame, or give away.",
    priceUsd: 2.5,
    uniquePhotos: 1,
    layout: {
      sheetWidth: 4,
      sheetHeight: 6,
      printRotation: 0,
      cells: [
        { x: 0, y: 0, width: 2, height: 3 },
        { x: 2, y: 0, width: 2, height: 3 },
        { x: 0, y: 3, width: 2, height: 3 },
        { x: 2, y: 3, width: 2, height: 3 },
      ],
    },
    editor: { defaultBorder: "none" },
  },
  passport: {
    sizeCode: "passport_6up",
    slug: "passport",
    displayName: "Passport Photos",
    tagline: "Six ID photos, one sheet.",
    description:
      "Six 2×2 inch passport-style photos on a single 4×6 sheet at standard ID size. Upload once and we lay out all six for you.",
    priceUsd: 3.0,
    uniquePhotos: 1,
    layout: {
      sheetWidth: 4,
      sheetHeight: 6,
      printRotation: 0,
      cells: [
        { x: 0, y: 0, width: 2, height: 2 },
        { x: 2, y: 0, width: 2, height: 2 },
        { x: 0, y: 2, width: 2, height: 2 },
        { x: 2, y: 2, width: 2, height: 2 },
        { x: 0, y: 4, width: 2, height: 2 },
        { x: 2, y: 4, width: 2, height: 2 },
      ],
    },
    editor: { defaultBorder: "none" },
  },
  mini: {
    sizeCode: "mini_pair",
    slug: "mini",
    displayName: "Mini Prints",
    tagline: "Eight prints. One sheet.",
    description:
      "Eight little 2×1.5 mini prints on one 4×6 sheet, all from one photo. Cut along the guides for a set to keep, share, or stick anywhere.",
    priceUsd: 2.0,
    uniquePhotos: 1,
    // One photo, tiled 8-up (2 columns × 4 rows) on a portrait 4×6 sheet.
    layout: {
      sheetWidth: 4,
      sheetHeight: 6,
      printRotation: 0,
      cells: [
        { x: 0, y: 0, width: 2, height: 1.5 },
        { x: 2, y: 0, width: 2, height: 1.5 },
        { x: 0, y: 1.5, width: 2, height: 1.5 },
        { x: 2, y: 1.5, width: 2, height: 1.5 },
        { x: 0, y: 3, width: 2, height: 1.5 },
        { x: 2, y: 3, width: 2, height: 1.5 },
        { x: 0, y: 4.5, width: 2, height: 1.5 },
        { x: 2, y: 4.5, width: 2, height: 1.5 },
      ],
    },
    editor: { defaultBorder: "none" },
  },
};
