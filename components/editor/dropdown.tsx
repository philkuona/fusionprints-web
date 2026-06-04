"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Small custom dropdown (button + popover) used for Paper / Border etc. Built
 * instead of a native <select> so the font + styling match the rest of the
 * platform (native select option lists use the OS font).
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col items-start rounded-xl border border-ink/15 bg-white px-3 py-2 text-left transition-colors duration-200 hover:border-ink/30"
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
          role="listbox"
          className="absolute left-0 z-30 mt-1 w-[min(15rem,80vw)] overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
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
