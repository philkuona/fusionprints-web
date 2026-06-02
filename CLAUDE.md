# FusionPrints Web — Claude Code Session Bootstrap

## Read first — always
Before doing anything, read these files in order:
1. `WEB-SESSION-BRIEFING.md` — full project context, workflow rules, reference sites
2. `.claude/skills/ui-ux-pro-max/SKILL.md` — UI/UX quality layer
3. `.claude/skills/fp-imagery/SKILL.md` — Unsplash imagery integration
4. `.claude/skills/fp-gemini-imagery/SKILL.md` — Gemini image generation
5. `/mnt/skills/user/fusionprints-creative/SKILL.md` — FusionPrints brand skill (if mounted)

## Key rules (summary — full detail in WEB-SESSION-BRIEFING.md)
- Shell commands: always tag **on laptop** or **on server**
- Never use PowerShell heredocs — write files directly
- `npx tsx` not `tsx` (not global)
- Deploy = `npm run deploy` from backend repo — commits all changes first
- Secrets never in chat
- No location references in copy — no cities, countries, regions
- No printer names in customer-facing copy (no Epson, DNP)
- No mention of Innovative Fusions / GIZMO Tech Store on customer-facing pages
- Reference sites: Mpix (primary), Printique, Nations Photo Lab — structure only, not copy
- UI/UX Pro Max guides quality + differentiation, not structure
- FP brand skill owns identity — Sunlit palette, fonts, voice are locked

## Current build status
Phase 2.0 complete — all 7 deliverables done.
2.0.7 (marketing pages) needs a full visual redo — typography-forward, selective premium imagery via Gemini.

## Next task
1. Use fp-gemini-imagery skill to generate all 8 images — save to public/images/
2. Quality check every image before saving (diversity, warmth, premium feel, no location IDs)
3. Rebuild app/page.tsx — NPL-inspired structure, two collection sections:
   - Photo Prints: 4 cards (4x6, 5x7, 6x6, 8x10)
   - Wall Art: 4 cards (11x14, 12x18, 16x20, Finish Guide)
   No prices on collection cards. Typography-forward. Selective imagery.
4. Rebuild app/how-it-works/page.tsx
5. Rebuild app/about/page.tsx

## Design direction
- Typography-forward, selective imagery (not image-heavy)
- NPL homepage structure as the reference
- FP identity on top: Sunlit palette, Fraunces headlines, Malachite accents
- UI/UX Pro Max for quality layer (accessibility, touch targets, transitions)
- No generic AI aesthetic — every design decision must be intentional

## Two repos
- Frontend: ~/dev/fusionprints-web (this repo)
- Backend: ~/dev/fusionprints (Fastify + Drizzle + Postgres)

## @AGENTS.md
@AGENTS.md
