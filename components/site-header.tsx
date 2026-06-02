"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";

const NAV = [
  { label: "Prints", href: "/prints" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label="FusionPrints home"
          className="shrink-0 cursor-pointer"
        >
          <Logo variant="color" height={44} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="flex h-11 cursor-pointer items-center px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex h-11 cursor-pointer items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile toggle — 44×44px touch target */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="-mr-2 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md text-ink transition-colors duration-200 hover:bg-ink/5 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-ink/10 bg-cream md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] cursor-pointer items-center rounded-md px-2 text-base font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-ink/10 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-full border border-ink/20 text-sm font-semibold text-ink transition-colors duration-200 hover:border-ink/40"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                Sign up
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
