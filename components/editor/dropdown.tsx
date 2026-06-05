"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Small custom dropdown (button + popover) used for Paper / Border etc. Built
 * instead of a native <select> so the font + styling match the rest of the
 * platform (native select option lists use the OS font).
 *
 * The popover is positioned with viewport-clamped fixed coordinates so it can
 * never run off-screen: clamped horizontally (the menu is wider than its column
 * on a phone) and flipped above the trigger when there isn't room below (these
 * options sit near the bottom of the editor on mobile). It re-positions on
 * scroll and resize so it tracks the trigger.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dismiss on tap/click outside.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  // Position the menu relative to the trigger, clamped within the viewport.
  // menuStyle is recomputed on every open, so it need not be cleared on close
  // (the menu only renders while `open`).
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const t = triggerRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const gutter = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const menuW = Math.min(240, vw - gutter * 2);
      // Measure the rendered menu so we know whether it fits below the trigger.
      const menuH = menuRef.current?.offsetHeight ?? 0;
      const left = Math.max(gutter, Math.min(r.left, vw - menuW - gutter));
      // Open downward by default; flip above the trigger if it would spill past
      // the bottom and there is more room above (mobile finish bar sits low).
      const spaceBelow = vh - r.bottom;
      const flipUp = menuH > 0 && spaceBelow < menuH + gutter && r.top > spaceBelow;
      const top = flipUp ? Math.max(gutter, r.top - 4 - menuH) : r.bottom + 4;
      setMenuStyle({ position: "fixed", top, left, width: menuW, maxHeight: vh - gutter * 2 });
    };
    place();
    // Re-run once the menu has rendered so its measured height drives the flip.
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    // Capture phase so inner scroll containers (the editor panels) are caught too.
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col items-start rounded-xl border border-ink/15 bg-white px-3 py-2 text-left transition-colors duration-200 hover:border-ink/30 lg:py-1.5"
      >
        {label && <span className="text-[11px] text-ink-mute">{label}</span>}
        <span className="flex w-full items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-ink">{current?.label ?? "Select"}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-ink-mute">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle ?? { position: "fixed", left: -9999, top: -9999 }}
          className="z-50 overflow-y-auto rounded-xl border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer flex-col items-start px-3 py-2 text-left transition-colors duration-200 hover:bg-ink/5 ${
                o.value === value ? "bg-malachite/10" : ""
              }`}
            >
              <span className="text-sm font-medium text-ink">{o.label}</span>
              {o.hint && <span className="text-[11px] text-ink-mute">{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
