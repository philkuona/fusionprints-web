"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Auto-rotating hero slideshow. Themed lifestyle images (newborn, wedding,
 * graduation, vintage reprint, everyday family) crossfade on the right of the
 * split hero. Pauses on hover; dots allow manual navigation.
 */
const SLIDES = [
  { src: "/images/hero-wedding.jpg", alt: "A laughing bride and groom embracing in a garden at golden hour" },
  { src: "/images/hero-newborn.jpg", alt: "A mother cradling her sleeping newborn in a warm, softly lit bedroom" },
  { src: "/images/hero-graduation.jpg", alt: "A graduate in cap and gown hugging his proud mother outdoors" },
  { src: "/images/hero-vintage.jpg", alt: "An older man holding a freshly reprinted faded photograph by a warm lamp" },
  { src: "/images/hero-family.jpg", alt: "Three generations of a family laughing over a photo album on the sofa" },
];

const INTERVAL = 4800;

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Only mount slides as they're needed (current + next), keeping shown ones
  // mounted for the crossfade. The off-screen slides are opacity-0 but still in
  // the viewport, so next/image can't lazy them — mounting on demand instead
  // means the homepage loads ~2 heroes, not all 5.
  const [shown, setShown] = useState<Set<number>>(() => new Set([0, 1 % SLIDES.length]));

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const markShown = () =>
      setShown((prev) => {
        const next = (i + 1) % SLIDES.length;
        if (prev.has(i) && prev.has(next)) return prev;
        const set = new Set(prev);
        set.add(i);
        set.add(next);
        return set;
      });
    markShown();
  }, [i]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, idx) =>
        shown.has(idx) || idx === i ? (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            priority={idx === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={`object-cover transition-opacity duration-1000 ease-out ${idx === i ? "opacity-100" : "opacity-0"}`}
          />
        ) : null,
      )}

      {/* Left-edge wash so the carousel melts into the ink panel on desktop */}
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-ink/60 via-transparent to-transparent lg:block" />

      {/* Manual nav dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Show slide ${idx + 1}`}
            aria-current={idx === i}
            className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${idx === i ? "w-6 bg-cream" : "w-2 bg-cream/50 hover:bg-cream/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
