# FusionPrints Web — Full Roadmap Beyond 2.0.7

This file exists so Claude Code knows the full project scope beyond the current task.
Do not start any phase without explicit instruction from the founder.
Each phase gets a full drill-down at its own kickoff — this is name-level only.

---

## CURRENT STATUS (updated 2026-06-04)
Phase 2.0 ✅ · Phase 2.1 ✅ (2.1.4 partial) · Phase 2.2 ✅ built — **GATE deferred**
(no mid-range Android; revisit via a real-device cloud + the `?perf` HUD).
Phase 2.3 🟢 **in progress** — W0 (web-order schema + createWebOrder) ✅ · W1 (cart) ✅ ·
W2 (checkout: fulfilment/address/totals) ✅ · W3 (virtualised payment + order creation) ✅ ·
W4 (paid→print jobs, agent serves processed render) ✅ · W5 (order history + tracking) ✅ —
full flow live-tested locally (editor→cart→checkout→pay→tracking, payment confirmed).
**Payments are service-virtualised** (no real gateway yet — see memory payment-virtualization).
Remaining: **W6** (order-confirmation/receipt email + polish), then deploy backend to prod
(runs migrations 0011/0012) so the Vercel frontend can use it.

---

## Phase 2.1 — Upload & Library (Month 2)

| # | Deliverable | Gate |
|---|---|---|
| 2.1.1 | Drag-and-drop multi-file upload UI | Founder uploads 5 files at once; all appear |
| 2.1.2 | B2 storage, user-scoped key structure | Files land in B2 under the user's namespace |
| 2.1.3 | "My Photos" library page (grid, select, delete) | Founder deletes one, it's gone on refresh |
| 2.1.4 | Resolution detection + low-res warning | Upload a tiny image; warning fires before size selection |
| 2.1.5 | EXIF orientation handling | Sideways phone photo displays upright |
| 2.1.6 | 90-day expiry cron | Cron logs a dry-run deletion list on server |
| 2.1.7 | Google sign-in / sign-up (OAuth), alongside existing email auth | Founder signs in with Google; session created; the customise auth-gate resumes the journey; email login still works |

Status (2026-06-02): 2.1.1 ✅ · 2.1.2 ✅ · 2.1.3 ✅ · 2.1.5 ✅ (EXIF baked server-side) · 2.1.6 ✅ (daily job + `npm run cleanup:images`, dry-run by default).
2.1.4 🟡 partial — resolution detection + a "Low-res" badge ship in the My Photos grid; the "warning before size selection" lands with the ordering journey (size selection lives there).
2.1.7 ✅ done — Google sign-in (server-side Authorization Code flow, mirrors QBO; no @fastify/oauth2), opens in an auto-closing popup. Auto-links to an existing email account. Live-tested (auto-link verified). See deploy checklist at the end for the production steps.

Storage: Backblaze B2 bucket `fusionprints-images`. User-scoped keys.
Dependency: B2 capacity check before starting.
Dependency: Google OAuth client credentials (founder obtains); decide email-verification handling for OAuth accounts.
Note: Google auth powers the "must be logged in to customise" gate on the web ordering journey — logged-out users hitting "Create your prints" go to login/sign-up (Google or email), then resume where they left off.

---

## Phase 2.2 — Editor (Month 3) — RISKY, BIGGEST UNKNOWN

| # | Deliverable | Gate |
|---|---|---|
| 2.2.1 | Konva editor scaffold in a print-size frame | Editor opens with an image loaded |
| 2.2.2 | Per-size aspect-ratio crop (locked to chosen print) | 8×10 crop cannot produce non-8×10 output |
| 2.2.3 | Rotate / flip | Visual check |
| 2.2.4 | Brightness/contrast/saturation/exposure sliders, live preview | Slider updates preview < 100ms on test phone |
| 2.2.5 | Auto-enhance toggle + B&W/sepia/vintage filters | Each filter visibly correct |
| 2.2.6 | Edit JSON payload structure designed + serialised | Payload validates against Zod schema |
| 2.2.7 | Sharp server-side applier (payload → print-ready file) | Web edit → server applies → output matches preview |
| GATE | Editor UX review | If UX weak on mid-range phone → switch to Pintura |

Primary: Konva.js. Fallback: Pintura (decision gate at end of 2.2).
Risk: performance on mid-range Android phones in Zimbabwe.

Status (2026-06-04): 2.2.1–2.2.7 ✅ built + on staging, plus heavy Mpix-style UX polish
(configurator, crop modal, effects two-canvas filter, safe-area checkpoint, tablet layouts).
**GATE DEFERRED** — no physical mid-range Android available. Plan: test via a real-device
cloud (BrowserStack / LambdaTest — REAL devices, not emulators, since this is a perf gate),
picking a budget Android (Galaxy A-series / Redmi). To make the gate measurable rather than
subjective, add a dev-only perf overlay (FPS + slider→preview ms) behind `?perf=1` before the
session. Konva→Pintura decision still rides on the pre-set criteria (slider p95 >100ms, pan/zoom
<~30fps, or WebGL fails).

---

## Phase 2.3 — Cart & Checkout (Month 4)

| # | Deliverable | Gate |
|---|---|---|
| 2.3.1 | Cart UI, per-item preview, mixed sizes | Two different sizes coexist in cart |
| 2.3.2 | Address selection (delivery or collection per order) | Switching mode updates totals |
| 2.3.3 | Stripe: server-side payment intents + webhooks | Test-mode payment completes, webhook marks order paid |
| 2.3.4 | EcoCash integration (shared module with WA channel) | Sandbox payment confirms |
| 2.3.5 | Order creation in shared orders table, channel:'web' | Order appears in DB and reaches print_jobs |
| 2.3.6 | Order tracking page (status parity with WhatsApp) | Status changes on server reflect on page |

Dependencies:
- Stripe account approval (apply EARLY — Zim-linked entity can take weeks)
- EcoCash API spec + credentials (founder obtains)
- Backend: add channel column to orders table (Drizzle migration)
- Backend: print agent must apply edit_payload via Sharp before printing

---

## Phase 2.4 — Polish & Launch (Month 5)

| # | Deliverable | Gate |
|---|---|---|
| 2.4.1 | SEO meta, sitemap, OG images, structured data | Lighthouse SEO ≥ 95 |
| 2.4.2 | Performance: lazy loading, code splitting | Lighthouse perf ≥ 85 on mobile |
| 2.4.3 | Mobile responsiveness across ALL flows | Every flow usable at 360px |
| 2.4.4 | Cross-browser test | Chrome/Safari/Firefox + Android Chrome pass |
| 2.4.5 | Beta with 10–20 waitlist customers | Beta cohort completes a real order |
| 2.4.6 | Soft launch + marketing push | Landing page replaced by web app |

OG images: generated via Gemini (sole image source rule applies).
Hosting at launch: Hetzner VPS alongside backend. Move to Vercel post-launch.

---

## Phase 2.5 — Copy & Promises Refinement (final full-site pass)

A dedicated pass — done near the end, once the flows exist — to lock the brand promises and refine every piece of customer-facing copy across the whole site. Reference Mpix / Nations Photo Lab for tone and structure only, never copy. "Hold the moment." stays sacred.

| # | Deliverable | Gate |
|---|---|---|
| 2.5.1 | Rewrite the brand promises (promise strip, value props, "What we promise") into one consistent, compelling voice | Founder signs off on the final promise set |
| 2.5.2 | Full copy audit of every customer-facing surface (home, how-it-works, about, product pages, auth, account, emails) | No banned terms; voice consistent across all pages |
| 2.5.3 | Microcopy pass — buttons, form labels, errors, empty states, confirmations | Every CTA and message reads in-voice |
| 2.5.4 | SEO / meta + OG copy finalised (titles, descriptions, share text) | Per-page titles and descriptions set |
| 2.5.5 | Terminology + consistency lock (sizes, finishes, product names, "Hold the moment." usage) | One glossary; no contradictions site-wide |

Hard bans enforced (see WEB-SESSION-BRIEFING.md): no location references, no printer names, no Innovative Fusions / GIZMO, no discount language.
Timing note: the headline promises ideally land before the 2.4 soft launch — 2.5.1 can pull forward if needed; the full audit stays last.

---

## Phase 2.6+ — Post-launch

- Upsell add-ons at the cart/summary step (frames, mounts, gift boxes) — space reserved in the editor's review/summary view
- Tier 2 editor: text overlays, borders, collages
- Photo book builder
- Photo card templates (birthday, wedding, graduation, newborn)
- Google Photos / Dropbox / iCloud import
- React Native app (≈70% code reuse from web)

---

## Architecture reference

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, TypeScript strict, Tailwind 4 |
| Client state | Zustand (cart + editor) |
| Server data | TanStack Query |
| Image editor | Konva.js → Pintura fallback |
| Server image processing | Sharp |
| Backend | Fastify + Drizzle + Postgres 16 (~/dev/fusionprints) |
| Storage | Backblaze B2 |
| Email | Resend |
| Payments | Stripe + EcoCash |
| Hosting (launch) | Hetzner VPS (178.104.67.122) |
| Hosting (post-launch) | Vercel |

---

## Non-negotiables (apply to every phase)

1. "Hold the moment." — sacred. Always Fraunces. Always Malachite.
2. Sunlit palette is exact — hex values never approximate.
3. Mpix is the quality benchmark.
4. Wall art (11×14, 12×18, 16×20) is the product moat — always prominent.
5. Web does not replace WhatsApp — equal channels.
6. Account-required — no guest checkout.
7. Mobile-first — design and test mobile before desktop.
8. Gemini is the sole image source — no stock photos, no placeholders.
9. No location references in copy.
10. No printer names in customer-facing copy.
11. No Innovative Fusions / GIZMO Tech Store on customer pages.

---

## Deploy checklist (production steps that live outside git)

These are mechanical deploy steps, not roadmap milestones — a normal `npm run deploy`
does not perform them. Action them when the relevant feature goes live (formal launch
is Phase 2.4.6). Prod host: Hetzner `178.104.67.122`, app at `/home/fusionprints/app`.

**Web app staging/launch — done 2026-06-03 (prod API ready for `app.fusionprints.co.zw`):**
- [x] Backend deployed (editor + auth routes); migrations `0009` + `0010` applied to PROD DB.
- [x] Prod `.env`: `WEB_URL=https://app.fusionprints.co.zw`, `PUBLIC_URL=https://api.fusionprints.co.zw`, `GOOGLE_*`/`RESEND_API_KEY`/`B2_*` set. Backup at `/home/fusionprints/app/.env.bak.*`.
- [x] Set a strong `ADMIN_SESSION_SECRET` (was EMPTY → was using the public dev fallback; security fix).
- [x] CORS allows `https://app.fusionprints.co.zw` (in code) + via `WEB_URL`.
- [x] **Frontend on Vercel** → `app.fusionprints.co.zw` live (auto-deploys from main; same registrable domain as the API → cookies work). Verified serving 2026-06-04.
- [x] **Backend prod deploy (2.3):** W0/W3/W4/W5 + migrations `0011` (web-order schema) + `0012` (virtual provider) applied to PROD DB on 2026-06-04; `/web/api/checkout` + `/web/api/orders` live (401 unauth).
- [ ] **Google sign-in on prod:** register redirect URI `https://api.fusionprints.co.zw/web/api/auth/google/callback` in Google Cloud Console. (founder — email signup+verify already works via Resend.)

**Real launch (Phase 2.4) — when the web app replaces the apex landing page:** repoint
`WEB_URL` if the app moves to the apex; revisit hosting (Vercel vs Hetzner).
