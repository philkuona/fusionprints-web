#!/usr/bin/env node
/**
 * FusionPrints — batch-generate all marketing imagery via Gemini.
 * Prompts follow the MASTER IMAGE PROMPT in
 * .claude/skills/fp-gemini-imagery/SKILL.md — diversity is the #1 rule.
 * The 9 slots below are a planned matrix: no two share >2 attributes
 * (race · age · gender · setting · subject type · occasion).
 *
 * Requires GEMINI_API_KEY (billing-enabled). Optional GEMINI_IMAGE_MODEL.
 *   node scripts/gen-all.mjs            # all
 *   node scripts/gen-all.mjs 4x6 wall   # only matching slugs
 */
import { spawnSync } from "node:child_process";

const BASE =
  "Premium editorial lifestyle photograph for a photo printing service website. " +
  "Benchmark: Artifact Uprising, Mpix, Nations Photo Lab. " +
  "Warm golden-hour or warm interior light, never cold or clinical. Candid, not posed — real, tender emotion. " +
  "Casual-smart, warm-toned, unbranded clothing. Shallow depth of field, fine detail, photorealistic, magazine quality. " +
  "Any photos visible within the prints show soft abstract landscape or nature with NO identifiable faces. " +
  "No text, no logos, no watermarks, no UI elements, no printer equipment or cameras, " +
  "and no location identifiers (no landmarks, flags, street signs or recognisable skylines).";

const ITEMS = [
  { slug: "card-prints-4x6", file: "public/images/card-prints-4x6.jpg", aspect: "4:5",
    prompt: "A young Black African couple in their late twenties at a sunlit kitchen counter, leaning together and smiling warmly as they look through a small stack of freshly printed 4x6 photographs they hold between them." },
  { slug: "card-prints-5x7", file: "public/images/card-prints-5x7.jpg", aspect: "4:5",
    prompt: "An older White European man in his sixties seated in a worn leather armchair beside a window, holding a single 5x7 print and gazing at it with quiet nostalgia in warm afternoon light." },
  { slug: "card-prints-6x6", file: "public/images/card-prints-6x6.jpg", aspect: "4:5",
    prompt: "Two young Black African children, a brother and sister, lying on a soft rug on a bedroom floor, arranging a scatter of square 6x6 prints into a neat grid and laughing together under warm lamplight." },
  { slug: "card-prints-8x10", file: "public/images/card-prints-8x10.jpg", aspect: "4:5",
    prompt: "An Indian mother in her thirties sitting outdoors on a garden bench with her baby on her lap, holding up an 8x10 print for the baby to see, soft golden-hour backlight through the leaves." },
  { slug: "card-wall-11x14", file: "public/images/card-wall-11x14.jpg", aspect: "4:5",
    prompt: "A young Black African woman with albinism — very pale, depigmented skin and pale blonde-white hair, with African facial features — standing in a bright, minimal warm interior, smiling as she admires a framed 11x14 print of an abstract landscape on a plaster wall. Portrayed with genuine warmth and dignity, candid and natural, soft warm light." },
  { slug: "card-wall-12x18", file: "public/images/card-wall-12x18.jpg", aspect: "4:5",
    prompt: "An East Asian teenage girl in her sunlit bedroom, proudly holding up a large 12x18 poster print of an abstract landscape that she is about to hang on the wall, a few personal touches nearby like a potted plant and a small stack of books. Absolutely no text, numbers, lettering or labels anywhere in the scene." },
  { slug: "card-wall-16x20", file: "public/images/card-wall-16x20.jpg", aspect: "4:5",
    prompt: "A Black African family — two parents in their forties and two children — gathered in a warm living room, hanging a large 16x20 framed print of an abstract landscape on the wall together, candid and joyful." },
  { slug: "card-finish-guide", file: "public/images/card-finish-guide.jpg", aspect: "4:5",
    prompt: "Close-up flat lay on a wooden table of two prints of the same abstract warm landscape laid side by side, one glossy and reflective, one soft lustre matte, a hand gently tilting one to reveal the difference in surface texture." },
  { slug: "about-lifestyle", file: "public/images/about-lifestyle.jpg", aspect: "3:2",
    prompt: "A warm, lived-in living room with a gallery wall of tastefully framed abstract prints; a Black African grandmother and her young grandchild sit together on the sofa nearby, sharing a quiet, tender moment in soft daylight." },

  // Login-screen collage (2x2) — all unique, never reused elsewhere
  { slug: "auth-collage-1", file: "public/images/auth-collage-1.jpg", aspect: "1:1",
    prompt: "Close-up of the hands of a Black African man gently sliding a freshly printed photograph into a simple wooden frame on a warm wooden table, soft golden window light." },
  { slug: "auth-collage-2", file: "public/images/auth-collage-2.jpg", aspect: "1:1",
    prompt: "A young Indian woman standing by a bright window, smiling warmly as she looks down at a small stack of printed photographs she holds in both hands, soft golden-hour light." },
  { slug: "auth-collage-3", file: "public/images/auth-collage-3.jpg", aspect: "1:1",
    prompt: "An overhead flat-lay of several printed photographs of soft abstract warm landscapes fanned across a pale linen surface beside a sprig of dried botanicals, warm natural light, no people." },
  { slug: "auth-collage-4", file: "public/images/auth-collage-4.jpg", aspect: "1:1",
    prompt: "A laughing young Black African child holding up a framed photograph with both hands toward the camera, warm sunlit living room behind, candid joy; the photo in the frame is a soft abstract landscape with no identifiable faces." },
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
    ["scripts/gen-image.mjs", item.file, item.aspect, `${item.prompt} ${BASE}`],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  if (r.status === 0) ok++;
}
console.log(`\n\n${ok}/${todo.length} generated.`);
process.exit(ok === todo.length ? 0 : 1);
