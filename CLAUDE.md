# FusionPrints Web — Claude Code Session Bootstrap

## Read first — always, in this order
1. `WEB-SESSION-BRIEFING.md` — current task, rules, design decisions, hard bans
2. `ROADMAP.md` — full project scope phases 2.1 through 2.5+
3. `.claude/skills/fp-gemini-imagery/SKILL.md` — Gemini image generation (read before any image)
4. `.claude/skills/ui-ux-pro-max/SKILL.md` — UI/UX quality layer

## Key rules (full detail in WEB-SESSION-BRIEFING.md)
- No location references in copy
- No printer names in customer copy (no Epson, DNP, Canon)
- No Innovative Fusions / GIZMO Tech Store on customer pages
- Gemini is the sole image source — no stock photos, no placeholders, no CSS shapes
- Sunlit palette exact — never approximate the hex values
- cursor-pointer on all clickables
- transition-colors duration-200 on all interactive elements
- 44px minimum touch targets
- next/image always — never raw img tags
- npx tsx not tsx
- Secrets never in chat or committed to git

## Two repos
- Frontend: ~/dev/fusionprints-web (this repo)
- Backend: ~/dev/fusionprints

## @AGENTS.md
@AGENTS.md
