"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/account/auth-guard";
import { Container } from "@/components/ui/container";
import { logout, type WebUser } from "@/lib/api/auth";

const NAV = [
  {
    label: "Profile",
    href: "/account/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    stub: true,
  },
  {
    label: "My Photos",
    href: "/account/photos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function AccountSidebar({ user }: { user: WebUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push("/");
  };

  return (
    <aside className="w-full shrink-0 md:w-56">
      <div className="mb-6 hidden md:block">
        <p className="text-sm font-medium text-ink">{user.email}</p>
        <p className="text-xs text-ink-mute">FusionPrints account</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "bg-malachite/10 text-ink"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              } ${item.stub ? "opacity-50" : ""}`}
            >
              <span className={active ? "text-malachite" : ""}>{item.icon}</span>
              {item.label}
              {item.stub && (
                <span className="ml-auto hidden rounded bg-ink/8 px-1.5 py-0.5 text-xs text-ink-mute md:inline">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-6 hidden cursor-pointer text-sm text-ink-mute transition-colors duration-200 hover:text-coral md:block"
      >
        Sign out
      </button>
    </aside>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {(user) => (
        <Container className="py-10">
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <AccountSidebar user={user} />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </Container>
      )}
    </AuthGuard>
  );
}
