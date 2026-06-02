#!/usr/bin/env node
/**
 * FusionPrints — batch-generate all marketing imagery via Gemini.
 * Runs scripts/gen-image.mjs for each item sequentially.
 * Requires GEMINI_API_KEY (billing-enabled). Optional GEMINI_IMAGE_MODEL.
 *
 *   node scripts/gen-all.mjs          # generate all
 *   node scripts/gen-all.mjs 4x6 wall # only matching slugs
 */
import { spawnSync } from "node:child_process";

const BRAND =
  "Premium editorial lifestyle photograph for a high-end photo printing brand, in the style of Artifact Uprising and Mpix. " +
  "Warm natural golden-hour light, soft shadows, shallow depth of field, clean minimal premium interior, warm cream and natural-wood tones. " +
  "Genuine candid moment, never posed stock. People of African descent prominently and naturally featured. " +
  "Any photo content shown within prints is soft abstract warm landscape or nature with NO identifiable faces. " +
  "Absolutely no text, no logos, no watermarks, no UI elements, no printer equipment or machinery, " +
  "and no location identifiers (no landmarks, flags, street signs or recognisable skylines). " +
  "Photorealistic, fine detail, magazine quality.";

const ITEMS = [
  { slug: "card-prints-4x6", file: "public/images/card-prints-4x6.jpg", aspect: "4:5",
    prompt: "Close-up of the hands of a young woman of African descent gently holding a small fan of freshly printed 4x6 glossy photographs near a sunlit window." },
  { slug: "card-prints-5x7", file: "public/images/card-prints-5x7.jpg", aspect: "4:5",
    prompt: "A single 5x7 matte photo print propped upright on a pale linen-covered windowsill, warm morning light raking across it, a soft blurred plant behind." },
  { slug: "card-prints-6x6", file: "public/images/card-prints-6x6.jpg", aspect: "4:5",
    prompt: "Hands of a middle-aged man of African descent holding a square 6x6 print over a warm wooden table scattered with a few other small prints." },
  { slug: "card-prints-8x10", file: "public/images/card-prints-8x10.jpg", aspect: "4:5",
    prompt: "An 8x10 photo print resting on a folded cream linen cloth on a wooden surface, soft golden side light, a few dried stems beside it." },
  { slug: "card-wall-11x14", file: "public/images/card-wall-11x14.jpg", aspect: "4:5",
    prompt: "An 11x14 framed print hanging on a warm off-white plaster wall in a minimal sunlit room, a slim shadow cast beside the simple wooden frame." },
  { slug: "card-wall-12x18", file: "public/images/card-wall-12x18.jpg", aspect: "4:5",
    prompt: "A 12x18 unframed poster print leaning against a softly lit warm wall on a wooden floor, a small ceramic vase nearby, calm minimal styling." },
  { slug: "card-wall-16x20", file: "public/images/card-wall-16x20.jpg", aspect: "4:5",
    prompt: "A woman of African descent standing back to admire a large 16x20 framed statement print mounted above a minimal wooden console, warm interior, seen from behind in soft focus." },
  { slug: "card-finish-guide", file: "public/images/card-finish-guide.jpg", aspect: "4:5",
    prompt: "Macro detail of two photo prints side by side at a raking angle, one glossy and reflective, one soft lustre matte, warm light revealing the difference in surface texture." },
  { slug: "about-lifestyle", file: "public/images/about-lifestyle.jpg", aspect: "3:2",
    prompt: "A warm, lived-in home interior in soft natural daylight: a small wall of tastefully framed photo prints, a family of African descent gently out of focus in the background sharing a quiet moment." },
];

const filters = process.argv.slice(2);
const todo = filters.length
  ? ITEMS.filter((i) => filters.some((f) => i.slug.includes(f)))
  : ITEMS;

let ok = 0;
for (const item of todo) {
  process.stdout.write(`\n▶ ${item.slug} (${item.aspect}) … `);
  const r = spawnSync(
    "node",
    ["scripts/gen-image.mjs", item.file, item.aspect, `${item.prompt} ${BRAND}`],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  if (r.status === 0) ok++;
}
console.log(`\n\n${ok}/${todo.length} generated.`);
process.exit(ok === todo.length ? 0 : 1);
