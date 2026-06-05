import Link from "next/link";
import { Container } from "@/components/ui/container";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Photo Prints", href: "/prints" },
      { label: "Wall Art", href: "/wall-art" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-cream">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand block */}
          <div>
            <p className="font-fraunces text-2xl font-bold leading-snug text-malachite">
              Hold the moment.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-cream/50">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex min-h-[44px] cursor-pointer items-center text-sm text-cream/75 transition-colors duration-200 hover:text-cream"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/10 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Fusion Prints Pvt Ltd. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
