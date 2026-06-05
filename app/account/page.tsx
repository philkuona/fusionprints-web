"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPhotos, type Photo } from "@/lib/api/photos";

const CARDS = [
  {
    href: "/account/orders",
    label: "Order History",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7M3 5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/account/photos",
    label: "My Photos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/account/profile",
    label: "Profile & Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AccountPage() {
  const [recent, setRecent] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPhotos()
      .then((list) => setRecent(list.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-center font-fraunces text-3xl font-bold text-ink sm:text-4xl">My Account</h1>

      {/* Action cards */}
      <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:border-malachite hover:bg-malachite/5"
          >
            <span className="text-ink-soft">{c.icon}</span>
            {c.label}
          </Link>
        ))}
      </div>

      {/* Recently added */}
      <section className="mt-12">
        <h2 className="text-center font-fraunces text-xl font-bold text-ink">Recently added</h2>
        <div className="mt-1 flex items-center justify-center gap-3 text-sm">
          <Link href="/account/photos" className="cursor-pointer font-medium text-malachite-deep transition-colors duration-200 hover:underline">
            Upload photos
          </Link>
          <span className="text-ink-mute">|</span>
          <Link href="/account/photos" className="cursor-pointer font-medium text-malachite-deep transition-colors duration-200 hover:underline">
            View all photos
          </Link>
        </div>

        {loaded && recent.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink-mute">
            No photos yet.{" "}
            <Link href="/account/photos" className="cursor-pointer underline underline-offset-2">
              upload some
            </Link>{" "}
            to start making prints.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/editor/${p.id}`}
                className="group relative block aspect-square overflow-hidden rounded-xl border border-ink/10 bg-ink/5"
              >
                <Image src={p.storageUrl} alt={p.originalFilename ?? "Photo"} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:bg-ink/25 group-hover:opacity-100">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink">Make prints</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
