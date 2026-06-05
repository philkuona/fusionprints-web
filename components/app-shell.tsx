"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollToTop } from "@/components/scroll-to-top";

/** These routes get their own full-bleed chrome — no global header/footer. */
const BARE_PREFIXES = ["/login", "/signup", "/verify", "/editor"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_PREFIXES.some(
    (p) => pathname === p || pathname?.startsWith(`${p}/`),
  );

  if (bare) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
