# Web Session Briefing — fusionprints-web

## How to use this file

Paste the entire contents of this file into your web Claude Code session as your **first message**. It will set up both design skills and all project rules for the session.

---

## Opening instruction (this applies to you, Claude)

You are building the FusionPrints website (`fusionprints-web`). For this session you must use **both** of the following design skills on every UI task:

1. **`anthropic-skills:fusionprints-creative`** — your built-in FusionPrints visual asset skill. Use it when generating hero images, section backgrounds, ad creatives, or any visual imagery for the site.

2. **UI/UX Pro Max** — installed at `.claude/skills/ui-ux-pro-max/`. Before writing any UI component or page, run the design system query below. Do not skip this step.

**Workflow you must follow for every UI task:**
1. Run the UI/UX Pro Max design system query for the component/page being built
2. Apply FusionPrints Sunlit brand tokens from `app/globals.css` (never use hardcoded colours)
3. Use `anthropic-skills:fusionprints-creative` for any visual/image assets
4. Apply all rules in the "Rules to enforce" section below
5. Run the pre-delivery checklist before every commit

---

## What Changed (commits pushed to main)

| Commit | Description |
|--------|-------------|
| `a0e0e98` | `2.0.1` — Scaffold Next.js 16 + TypeScript strict + Tailwind 4 |
| `a8a1040` | `2.0.2` — Sunlit brand tokens + Fraunces/Outfit/DM Mono fonts + `/styleguide` route |
| `74264dc` | Add UI/UX Pro Max design skill to `.claude/skills/ui-ux-pro-max/` |

Run `git pull` to get latest, or you already have it if you cloned fresh.

---

## Brand Tokens (Sunlit palette — `app/globals.css`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cream` | `#fbf7f0` | Background |
| `--color-ink` | `#1f1b16` | Primary text |
| `--color-malachite` | `#05d668` | Primary CTA / brand green |
| `--color-malachite-deep` | `#04a551` | Hover state for CTAs |
| `--color-coral` | `#ff7a59` | Accent / alerts |
| `--color-amber` | `#efab11` | Highlights / badges |
| `--color-ink-soft` | `#4a3f32` | Secondary text |
| `--color-ink-mute` | `#8a7b66` | Placeholder / muted text |

Fonts: **Fraunces** (display/headings) · **Outfit** (body) · **DM Mono** (code/labels)

Preview tokens at: http://localhost:3000/styleguide

---

## UI/UX Pro Max Skill

A design intelligence skill is installed at `.claude/skills/ui-ux-pro-max/`. It contains:
- 67 UI styles, 96 colour palettes, 57 font pairings, 99 UX guidelines, 25 chart types
- Stack-specific guidelines for Next.js, React, Tailwind, shadcn/ui, and more
- A BM25 search engine (`scripts/search.py`)

### How to invoke it on every UI task

**Step 1 — Always start with a design system query:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "photo printing SaaS WhatsApp warm friendly" --design-system -p "FusionPrints" -f markdown
```

**Step 2 — Persist it (do this once per project):**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "photo printing SaaS WhatsApp warm friendly" --design-system --persist -p "FusionPrints"
```
This creates `design-system/MASTER.md` as the source of truth for all pages.

**Step 3 — Page-specific overrides (e.g. for a dashboard page):**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "order dashboard admin" --design-system --persist -p "FusionPrints" --page "dashboard"
```

**Step 4 — Domain searches for extra detail:**
```bash
# UX guidelines
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Typography alternatives
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "warm friendly serif" --domain typography

# Stack-specific (we use Next.js + Tailwind)
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "layout responsive" --stack nextjs
```

### Rules to enforce on every component you write

- No emoji icons — use SVG (Lucide or Heroicons)
- All clickable elements must have `cursor-pointer`
- Hover transitions: `transition-colors duration-200`
- Minimum touch target: 44×44px
- Body text minimum: 16px on mobile
- Contrast ratio: 4.5:1 minimum (normal text)
- Respect `prefers-reduced-motion`
- No horizontal scroll on mobile
- Floating navbar: use `top-4 left-4 right-4` not `top-0`

### Pre-delivery checklist (run before every commit)
- [ ] No emojis as icons
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states don't cause layout shift
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Responsive at 375px / 768px / 1024px / 1440px
- [ ] All images have `alt` text
- [ ] Form inputs have `<label>` elements
- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm run build` — compiled successfully

---

## Stack

- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Fonts:** Google Fonts via `next/font`
- **Repo:** https://github.com/philkuona/fusionprints-web
- **Branch:** `main`

---

## Before Every Build Session

1. Run the design system query above for the page/component you're building
2. Check `design-system/MASTER.md` if it exists
3. Apply the pre-delivery checklist before committing


---

## COPY RULES UPDATE — CRITICAL

### No em dashes anywhere on the website
Em dashes (—) are a clear AI writing tell. They are banned from all customer-facing copy across every page, component, and piece of UI text. Use commas, full stops, or restructure the sentence instead. Never use — as a separator.

Before pushing any page, scan all copy for em dashes and rewrite naturally.

### Locked promise copy — use exactly as written, no alterations
These three promises appear on the homepage promise strip and anywhere promises are referenced. Do not rewrite them. Do not add em dashes. Do not make them "cleaner."

Promise 1:
Heading: We print it ourselves. Every single one.
Body: No outsourcing. No "sent to a lab somewhere." Your photos stay with us from upload to handoff, which means if something's off, we catch it before you do.

Promise 2:
Heading: Blink and it's ready.
Body: 24 hours. Sometimes less. We're not waiting on anyone because we're doing it all ourselves. Your wall won't stay empty for long.

Promise 3:
Heading: Ordering a print shouldn't feel like filing taxes.
Body: Two minutes on WhatsApp. A few taps on the web. That's it. We built the simplest checkout in the room because life's too short for complicated.
