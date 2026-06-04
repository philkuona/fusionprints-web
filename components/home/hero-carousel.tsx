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

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, idx) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.alt}
          fill
          priority={idx === 0}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={`object-cover transition-opacity duration-1000 ease-out ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}

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
