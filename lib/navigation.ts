/**
 * Site navigation — data-driven.
 *
 * The header renders from this config. A top-level item is either a direct link
 * (`href`) or a mega-menu parent (`megaMenu`, not itself clickable). Adding a new
 * product to a category is a config change here only — no component changes.
 */

export interface NavMegaMenuItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavSection {
  heading?: string;
  items: NavMegaMenuItem[];
}

export interface NavMegaMenu {
  sections: NavSection[];
}

export interface NavItem {
  label: string;
  /** Present → a direct link. Absent → a mega-menu parent (not clickable). */
  href?: string;
  megaMenu?: NavMegaMenu;
}

export const NAVIGATION: NavItem[] = [
  {
    label: "Photo Prints",
    megaMenu: {
      sections: [
        {
          items: [
            { label: "Photo Prints", href: "/prints", description: "Classic single-photo prints, 4×6 to 8×10." },
            { label: "Wallet Prints", href: "/prints/wallet", description: "Four 2×3 keepsakes from one photo." },
            { label: "Mini Prints", href: "/prints/mini", description: "Two mini prints, side by side." },
            { label: "Passport Photos", href: "/prints/passport", description: "Six 2×2 ID photos in a set." },
          ],
        },
      ],
    },
  },
  {
    label: "Wall Art",
    megaMenu: {
      sections: [
        {
          items: [
            { label: "Poster Prints", href: "/wall-art", description: "Statement wall pieces, 11×14 to 16×20." },
          ],
        },
      ],
    },
  },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];
