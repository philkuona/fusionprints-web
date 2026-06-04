"use client";

import Image from "next/image";

/**
 * One-time checkpoint shown before a user enters the crop editor. Explains the
 * dashed safe-area line (keep important content inside it) and that everything
 * inside the frame prints. The demo photo is Gemini-generated (brand imagery);
 * the dashed line + pointer are UI overlays (no text is baked into the image).
 */
export function SafeAreaIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-6 text-center shadow-2xl">
        <h2 className="font-fraunces text-xl font-bold text-ink">Keep the important bits inside the line</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          Everything inside the frame prints. The <strong className="font-semibold text-ink">dashed line</strong> is a
          safe zone — keep faces and key details inside it so nothing important is lost near the edge.
        </p>

        {/* Demo: photo fills the print frame; dashed safe line + pointer overlaid */}
        <div
          className="relative mx-auto mt-5 overflow-hidden rounded-lg bg-ink/5 shadow-md"
          style={{ aspectRatio: "4 / 5", maxWidth: 240 }}
        >
          <Image
            src="/images/card-prints-5x7.jpg"
            alt="A portrait shown inside a print frame, with a dashed line marking the safe area"
            fill
            sizes="240px"
            className="object-cover"
          />
          {/* dashed safe-area line */}
          <span
            className="pointer-events-none absolute rounded-[2px] border border-dashed border-white/90"
            style={{ top: "7%", left: "7%", right: "7%", bottom: "7%" }}
          />
          {/* pointer chip */}
          <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-cream">
            ↓ keep faces &amp; details inside
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ink-mute">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-[1px] border border-dashed border-ink-mute" /> safe zone
          </span>
          <span>· whole frame prints</span>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
        >
          Got it — continue
        </button>
      </div>
    </div>
  );
}
