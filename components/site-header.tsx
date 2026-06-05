"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { getMe, logout, type WebUser } from "@/lib/api/auth";
import { cartCount, subscribeCart } from "@/lib/cart";

const NAV = [
  { label: "Prints", href: "/prints" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

const ACCOUNT_MENU = [
  { label: "Profile", href: "/account/profile" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Orders", href: "/account/orders" },
  { label: "My Photos", href: "/account/photos" },
];

/** Up to two letters from the email's local part, for the avatar. */
function initials(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile panel
  const [menuOpen, setMenuOpen] = useState(false); // account dropdown
  const [user, setUser] = useState<WebUser | null>(null);
  const [checked, setChecked] = useState(false); // has the first auth check resolved?
  const [cart, setCart] = useState(0); // total prints in the cart
  const menuRef = useRef<HTMLDivElement>(null);

  // Keep the cart badge in sync with localStorage (same-tab + cross-tab).
  useEffect(() => {
    const sync = () => setCart(cartCount());
    sync();
    return subscribeCart(sync);
  }, []);

  // Re-check the session on mount and on every navigation, so the header
  // reflects login/logout without a full page reload.
  useEffect(() => {
    let active = true;
    getMe()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setChecked(true));
    return () => {
      active = false;
    };
  }, [pathname]);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout().catch(() => {});
    // Hard navigation: fully re-initialise the app against the now-destroyed
    // session so no stale client state or cached /me can keep the header signed in.
    window.location.href = "/";
  };

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
            href="/cart"
            aria-label={cart > 0 ? `Cart, ${cart} ${cart === 1 ? "print" : "prints"}` : "Cart"}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {cart > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-cream">
                {cart}
              </span>
            )}
          </Link>
          {!checked ? (
            // Reserve space during the auth check to avoid a logged-in/out flash.
            <div className="h-11 w-11 animate-pulse rounded-full bg-ink/5" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  initials(user.email)
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink/10 bg-cream py-1.5 shadow-lg shadow-ink/5"
                >
                  <p className="truncate px-4 py-2 text-xs text-ink-mute">
                    {user.email}
                  </p>
                  <div className="my-1 border-t border-ink/8" />
                  {ACCOUNT_MENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[44px] cursor-pointer items-center px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-ink/8" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex min-h-[44px] w-full cursor-pointer items-center px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-coral"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile cart + toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            aria-label={cart > 0 ? `Cart, ${cart} ${cart === 1 ? "print" : "prints"}` : "Cart"}
            className="relative flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md text-ink transition-colors duration-200 hover:bg-ink/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {cart > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-cream">
                {cart}
              </span>
            )}
          </Link>
          {/* Toggle — 44×44px touch target */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="-mr-2 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md text-ink transition-colors duration-200 hover:bg-ink/5"
          >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
          </button>
        </div>
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

            {user ? (
              <>
                <div className="mt-2 border-t border-ink/10 pt-2">
                  <p className="truncate px-2 py-1 text-xs text-ink-mute">
                    {user.email}
                  </p>
                  {ACCOUNT_MENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] cursor-pointer items-center rounded-md px-2 text-base font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-md px-2 text-base font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-coral"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
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
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
