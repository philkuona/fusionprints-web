import Link from "next/link";
import { Container } from "@/components/ui/container";

const WA = "https://wa.me/263781387466";

const COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
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
    heading: "Support",
    links: [
      { label: "FAQs", href: "/how-it-works#faq" },
      { label: "Delivery & collection", href: "/shipping" },
      { label: "Chat on WhatsApp", href: WA, external: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/fusionprints.zw",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/fusionprints",
    icon: <path d="M14 9h2.5V6H14c-2 0-3 1.3-3 3.2V11H9v3h2v6h3v-6h2.2l.4-3H14V9.6c0-.4.2-.6.6-.6z" fill="currentColor" />,
  },
  {
    label: "WhatsApp",
    href: WA,
    icon: (
      <path
        d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.6 13l-.3-.2-2.3.6.6-2.2-.2-.3A7 7 0 0112 5zm-2.3 3.3c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 1.9s.8 2.2 1 2.3c.1.2 1.6 2.5 4 3.4 2 .8 2.4.6 2.8.6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.7-.3s-1.1-.5-1.3-.6c-.2 0-.3-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1-.3-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.6-1.5c-.2-.4-.3-.3-.5-.3z"
        fill="currentColor"
      />
    ),
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink/10 bg-white text-ink">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2.8fr]">
          {/* Brand + social */}
          <div>
            <p className="font-fraunces text-2xl font-bold leading-snug text-malachite">
              Hold the moment.
            </p>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Premium photo prints and wall art, made from the photos you love.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns: 2 per row on mobile, 4 across on desktop */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-mute">
                  {col.heading}
                </h3>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((l) =>
                    l.external ? (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[40px] cursor-pointer items-center text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                        >
                          {l.label}
                        </a>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="flex min-h-[40px] cursor-pointer items-center text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-6 text-xs text-ink-mute">
          <p>&copy; {year} Fusion Prints Pvt Ltd. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
