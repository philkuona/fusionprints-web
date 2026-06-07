"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { NAVIGATION, type NavItem } from "@/lib/navigation";

/**
 * Desktop primary navigation with data-driven mega menus.
 *
 * - Mega-menu parents are buttons (not links) — they open a panel on hover
 *   (short delay), focus, or Enter/Space; Escape closes; arrows move between
 *   items. Direct items render as links.
 * - ARIA: role="menubar" / menuitem, aria-haspopup / aria-expanded on parents.
 */
export function DesktopNav() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleOpen = useCallback((i: number) => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpenIndex(i), 120);
  }, []);
  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 180);
  }, []);

  return (
    <nav
      role="menubar"
      aria-label="Primary"
      className="hidden items-center gap-8 md:flex"
      onMouseLeave={scheduleClose}
    >
      {NAVIGATION.map((item, i) =>
        item.megaMenu ? (
          <MegaItem
            key={item.label}
            item={item}
            open={openIndex === i}
            onOpenIntent={() => scheduleOpen(i)}
            onCloseIntent={scheduleClose}
            onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
            onClose={() => setOpenIndex(null)}
            onKeepOpen={clearTimers}
          />
        ) : (
          <Link
            key={item.label}
            href={item.href!}
            role="menuitem"
            className="cursor-pointer text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}

function MegaItem({
  item,
  open,
  onOpenIntent,
  onCloseIntent,
  onToggle,
  onClose,
  onKeepOpen,
}: {
  item: NavItem;
  open: boolean;
  onOpenIntent: () => void;
  onCloseIntent: () => void;
  onToggle: () => void;
  onClose: () => void;
  onKeepOpen: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    } else if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      wrapRef.current?.querySelector<HTMLAnchorElement>("a[role='menuitem']")?.focus();
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const links = Array.from(
      wrapRef.current?.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']") ?? [],
    );
    const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      links[Math.min(idx + 1, links.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      links[Math.max(idx - 1, 0)]?.focus();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={onOpenIntent}
      onMouseLeave={onCloseIntent}
    >
      <button
        type="button"
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink aria-expanded:text-ink"
      >
        {item.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={item.label}
          onMouseEnter={onKeepOpen}
          onKeyDown={onPanelKeyDown}
          className="absolute left-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-ink/10 bg-cream shadow-lg shadow-ink/5"
        >
          <div className="h-1 bg-malachite" />
          <div className="p-2">
            {item.megaMenu!.sections.map((section, si) => (
              <div key={si}>
                {section.heading && (
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
                    {section.heading}
                  </p>
                )}
                {section.items.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    role="menuitem"
                    onClick={onClose}
                    className="block cursor-pointer rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-ink/5"
                  >
                    <span className="block text-sm font-semibold text-ink">{sub.label}</span>
                    {sub.description && (
                      <span className="mt-0.5 block text-xs text-ink-mute">{sub.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
