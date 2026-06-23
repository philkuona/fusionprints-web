# FusionPrints Codebase Audit

**Date:** 2026-06-09 · **Scope:** all three repos — backend (`~/dev/fusionprints`), web (`~/dev/fusionprints-web`), print agent (`~/dev/fusionprints-agent`) · **Mode:** read-only; no fixes applied.
**Method:** six parallel code-investigation passes (system map, data layer, security/concurrency, image pipeline, brand/unfinished, architecture/quality), cross-checked against live prod and dev databases over SSH/psql. Findings marked **[verified]** were reproduced firsthand (code read + live DB/log evidence), not just reported by a pass.

Severity scale: **Critical** (money/data loss or trivial exploit) > **High** > **Medium** > **Low**. Effort: **S** (≤half day) / **M** (1–3 days) / **L** (1+ week).

---

## 1. SYSTEM MAP

### Backend (`fusionprints` — Fastify + Drizzle + Postgres, deployed on Hetzner via systemd)

| Module | What it does | Entry points | Completeness |
|---|---|---|---|
| **WhatsApp bot — state machine** | Pure function: (step, context, message) → replies + next state + effects. ~24 steps: product/size/upload/quantity/fulfillment/payment, composite flows (wallet/passport/mini), batch + web-upload modes | `src/bot/state-machine.ts` (~1,300 lines, called only by handler) | **Working** |
| **WhatsApp bot — handler** | Loads customer + conversation state, runs state machine, executes side-effects (order create, payment initiate, upload-session create/resolve, lookup), saves state | `src/bot/handler.ts` → called from webhook | **Working** (effect switch growing; card-payment effect is a stub) |
| **WhatsApp bot — messages** | All customer copy centralized | `src/bot/messages.ts` | **Working** (brand-rule violations — see §4) |
| **WhatsApp webhook** | GET verify + POST receive (text/image/document/interactive), image download from 360dialog, reply dispatch | `src/routes/whatsapp-webhook.ts` (`GET/POST /webhook/whatsapp`) | **Working but unauthenticated in prod** (see BUG-3) |
| **Web API — auth** | Signup + email verification (Resend), login/logout, sessions (Postgres store), Google OAuth | `src/routes/web/auth.ts`, `web/google-auth.ts` | **Working** |
| **Web API — photos/editor/imports** | B2 upload + library, server-side edit applier (Sharp, parity formulas), Google Photos Picker import | `web/photos.ts`, `web/editor.ts`, `web/imports.ts`, `services/edit-applier.ts` | **Working** (Google Photos behind `GOOGLE_PHOTOS_IMPORT_ENABLED` flag) |
| **Web API — checkout + orders** | Cart validation (ownership, size match, composite cells), order create, Payonify session, mock confirm step, order list/detail | `web/checkout.ts`, `web/orders.ts` | **Working** — but the mock `/confirm` is live for ALL providers (BUG-1) |
| **Payments — Payonify** | Embedded checkout session (web), EcoCash USSD charge (bot), HMAC-SHA256 webhook verify (ns-timestamp normalized) | `services/payonify.ts`, `routes/web/payonify-webhook.ts` (`POST /web/api/payments/payonify/webhook`) | **Working** (live-tested in test mode, both channels) |
| **Payments — legacy stubs** | Magetsi EcoCash webhook (no signature), Stripe webhook (empty stub), bot card payment (placeholder URL) | `routes/payment-webhooks.ts` (`POST /webhook/payment/ecocash`, `/webhook/payment/stripe`), `services/payment.ts` | **Stub** — ecocash endpoint is live + unauthenticated (BUG-2) |
| **Slip/label system** | order_info / end_separator / promo (4×6 dye-sub, SVG→Sharp PNG→B2) + envelope_label (ZPL, thermal); brand fonts via FONTCONFIG | `services/slip-renderer.ts`, `utils/fonts.ts`, queued from `services/order.ts` | **Working** (thermal path **unverified** — no hardware yet) |
| **Product catalog + pricing** | 8 photo/poster sizes + 3 composites; pure `calculateQuote`; bulk-discount tiers (currently zeroed); admin price overrides mutated onto in-memory PRODUCTS | `config/catalog.ts`, `services/pricing.ts`, `services/price-overrides.ts`, `routes/admin-pricing.ts` | **Working** (single-instance assumption — see IMP-12) |
| **Admin dashboard** | Order management (default `/admin/jobs`), metrics, printers, pricing, promos, QBO OAuth + receipt posting, login (admin + operator roles) | `routes/admin-ops.ts` (1,567 lines), `admin-dashboard.ts`, `admin-login.ts`, `admin-pricing.ts`, `admin-promos.ts`, `qbo-auth.ts`, `admin-fonts.ts` | **Working** (HTML-in-route-file architecture — see IMP-1) |
| **Agent API** | Job polling (`next-job` per printer type with slip sequencing), start/done/fail, heartbeat; `X-Print-Agent-Key` auth | `routes/agent-api.ts` | **Working** (no job claiming — BUG-7) |
| **Virtual printers** | In-process simulator polling the real agent API; drives jobs printing→done with no output | `services/virtual-printer.ts` (`VIRTUAL_PRINTERS=true`) | **Working** — currently **ON in prod**; must be off before launch; races a real agent (BUG-7) |
| **Upload sessions** | Tokened web bulk-upload page for bot customers (1h expiry), resume via "✅ I've uploaded" button | `routes/upload.ts` (`/u/:token`, `/api/upload/*`) | **Working** (footer brand violation — BRAND-1) |
| **Landing/waitlist** | Tracking pixel + waitlist form | `routes/landing.ts` | **Working** |
| **Image cleanup** | Daily sweep of expired web images/renders (dry-run default) | `services/image-cleanup.ts` | **Partial** — WhatsApp-image 30-day cleanup is *not* automated; prod currently `dryRun: true` |
| **QBO integration** | OAuth + SalesReceipt/RefundReceipt on fulfil (fire-and-forget) | `services/qbo.ts`, tokens in `./qbo-tokens.json` | **Working** (optional; token file on disk) |

### Web frontend (`fusionprints-web` — Next.js 16, Vercel)

| Area | Entry points | Completeness |
|---|---|---|
| Marketing pages (home incl. Photo sets row, prints, wall-art, about, how-it-works, legal, styleguide) | `app/page.tsx`, `app/prints/*`, `app/wall-art`, etc. | **Working** |
| Photo editor (fixed-frame crop, rotate/flip, WebGL color parity, filters, auto-enhance) | `app/editor/[photoId]/page.tsx` (1,400+ lines), `components/editor/*`, `lib/edit/*` | **Working** (real-device Android gate still pending) |
| Composite editors (wallet/mini/passport: product page → `/create` editor, per-cell pan/zoom/rotate/border, My Photos picker) | `app/prints/{wallet,mini,passport}/…`, `components/composite-editor/*`, `lib/composite-editor/*` | **Working** |
| Account area (photos library + Google import, addresses, orders, profile) | `app/account/*` | **Working** |
| Cart + checkout + payment (localStorage cart, intl phone input, Payonify Drop-In modal with order-status polling, mock fallback) | `lib/cart.ts`, `app/checkout/*`, `lib/payonify.ts` | **Working** |
| Auth pages (login/signup/verify, Google popup) | `app/(auth)/*` | **Working** |

### Print agent (`fusionprints-agent` — Windows service via node-windows, runs compiled `dist/`)

| Module | Entry points | Completeness |
|---|---|---|
| Poll loop (per printer type), retry/backoff, graceful shutdown | `src/agent.ts` ← `src/index.ts` | **Working** (currently **parked/stopped** on the mini PC while virtual printers test) |
| Image processor (EXIF rotate, orientation match, resize cover, 300 DPI) | `src/image-processor.ts` | **Working** |
| Composite renderer (multi-cell sheet, pan/zoom honored, cut lines, printRotation) | `src/composite-renderer.ts` | **Working** (never exercised on real hardware for composites yet) |
| Printer driver (PowerShell dispatch, DNP/Epson; thermal ZPL path) | `src/printer-driver.ts` | **Working** for DNP/Epson; **thermal unverified** (`// UNVERIFIED until the thermal printer is installed`) |

**Dead code found:** essentially none. All registered routes are reachable; no orphaned modules. The only "registered but inert" surfaces are the stub payment endpoints (intentional placeholders).

---

## 2. DATA LAYER

18 tables, all actively read and written (no orphaned tables). Full column inventory in `src/db/schema.ts`; the highlights and problems:

### 2.1 Schema drift — **[verified against live DBs]**

| Check | Result |
|---|---|
| Drizzle snapshot (0019) vs **prod** columns | **Exact match** — all 165 columns, all enum values (incl. `payonify`, `composite`) ✔ |
| Drizzle snapshot vs **dev** DB | **DRIFT: dev is missing the `site_visits` and `waitlist` tables entirely** (10 columns) |
| Migration files vs journal | 20 files; prod journal table has **19** rows, dev has **18**. Migrations `0004_phase_d_foundation`, `0005_landing_page_tracking`, `0008_luxuriant_leper_queen` are hand-authored; 0004's own header admits drizzle-kit's snapshot history was missing 0004–0007. The numbering survived, but the journal/desync is why a fresh/dev DB can silently lack 0005's tables while believing itself migrated |

**Risk:** anything developed against dev that touches `site_visits`/`waitlist` fails locally; worse, the precedent means `db:migrate` success ≠ schema complete. (Severity: Medium, Effort: S — re-baseline dev or add a schema-diff CI check.)

### 2.2 Unbounded growth / missing cleanup

| Table | Growth | Cleanup today |
|---|---|---|
| `site_visits` | every landing hit | **none** |
| `payments` | 1+/order, with raw `webhook_payload` JSONB | **none** |
| `print_jobs` / `slip_jobs` | 1–6/order | **none** |
| `upload_sessions` | 1h-TTL tokens | **none** (expired rows linger) |
| `images` (WhatsApp, 30-day) | per upload | **not automated** (web 90-day sweep exists; prod sweep is `dryRun: true`) |
| `web_sessions` | per login | ✔ daily sweep (indexed) |
| `images`/`processed_images` (web) | per upload/edit | ✔ daily job — but **dry-run on prod**, so effectively off |

(Severity: Medium aggregate, Effort: S–M — add sweeps, flip dry-run deliberately.)

### 2.3 Soft drift / unvalidated shapes

- `order_status = 'ready_for_collection'` is legacy, kept for back-compat; admin-ops still renders a button branch for it.
- Unvalidated JSONB whose shape is load-bearing: `conversation_state.context` (bot cart!), `order_items.layout_payload` (composite cells → what gets printed), `slip_jobs.payload_json`, `payments.webhook_payload`, `promo_campaigns.slot1/2`, `processed_images.edit_payload`. Only `edit_payload` has a Zod schema at write time.
- Text columns encoding enums without CHECK: `order_items.paper`, `upload_sessions.status`, `payments.payment_method`.

### 2.4 FK/index gaps

- `order_items.image_id` unindexed (used by the cleanup anti-join).
- Agent polling filters `(status, target_printer_type)` — two single-column indexes; a composite index would serve the hottest query.
- No DB-level constraint that an order has `customer_id` XOR `web_user_id`, or webUser `password_hash` OR `google_id` (app-enforced only).

### 2.5 Who reads/writes what (condensed)

- **orders/order_items**: written by `services/order.ts` (bot + web paths) and checkout; read by admin-ops/dashboard, agent-api, web/orders, notifications. Status flow has two writers: webhooks (paid) and admin actions (release/ship/fulfil).
- **payments**: written by web/checkout + payonify-webhook (+ legacy payment-webhooks); read by admin order detail and the checkout poll (via order detail `paymentStatus`).
- **conversation_state**: read-modify-write per WhatsApp message with **no locking** (BUG-4).
- **product_prices**: read once at startup and **mutated onto the in-memory catalog**; written by admin pricing (IMP-12).
- **images**: polymorphic (customer XOR web_user); deletions use `SET NULL` on order_items so orders survive image cleanup ✔.

---

## 3. BUGS & RISKS (ranked)

### Critical

| # | Finding | Where | Failure scenario | Effort |
|---|---|---|---|---|
| **BUG-1 [verified]** | **Mock payment confirm works for real-gateway orders.** `POST /web/api/checkout/:orderNumber/confirm` marks any *owned* `pending_payment` order paid — including Payonify orders — with no provider check. The only auth is the user's own session, so any signed-in customer can place an order, skip the Drop-In, call confirm, and get prints **without paying** | `routes/web/checkout.ts` confirm handler | Logged-in user cURLs `{"outcome":"success"}` → `markOrderPaid` → jobs enqueued + confirmation email. Free goods | **S** (gate confirm to `provider === 'virtual'`) |
| **BUG-2 [verified]** | **Unauthenticated EcoCash webhook.** `POST /webhook/payment/ecocash` trusts `body.reference` + `status:'success'` with zero signature verification (TODO comment in code) and is registered in prod | `routes/payment-webhooks.ts:79` | Anyone who can guess/observe an order number (`FP-2026-NNNN`, sequential!) marks arbitrary orders paid | **S** (disable route until Magetsi spec, or shared-secret it) |
| **BUG-3 [verified live]** | **WhatsApp webhook POST is fully open in prod.** Optional Basic auth exists but `WHATSAPP_WEBHOOK_USER/PASS` are **EMPTY on prod** (checked live); no payload signature check. Anyone can POST forged customer messages | `routes/whatsapp-webhook.ts` POST handler | Attacker injects messages as any phone number: creates orders, triggers EcoCash charges to victims' numbers, drives the bot arbitrarily | **S** (set the env pair now; signature verification M) |
| **BUG-4** | **Bot conversation state race (read-modify-write, no lock).** Two near-simultaneous messages from the same customer each load state, process, and upsert — last write clobbers. No transaction, no version | `services/conversation-state.ts` + `bot/handler.ts` | Rapid taps ("1" then "2", or double-sent image) → lost cart items, step/context mismatch, double effect execution (double EcoCash push observed risk) | **M** (per-customer serialization: `SELECT … FOR UPDATE` around handle, or in-process queue keyed by customer) |

### High

| # | Finding | Where | Notes | Effort |
|---|---|---|---|---|
| **BUG-5** | **Greeting/reset words destroy mid-order state.** `HI/HELLO/MENU/RESTART/…` reset to `emptyContext()` from ANY step — including `awaiting_ecocash_pin` with a created (possibly charging!) order. Order is orphaned, customer loses the order number | `bot/state-machine.ts` RESET_WORDS gate | Guard mid-payment/mid-cart steps with a confirm ("You have an order in progress…") | **S–M** |
| **BUG-6 [verified]** | **WhatsApp images never EXIF-baked.** `storeImage()` stores original bytes (no `.rotate()`), while `storeWebImage()` bakes EXIF. Every consumer must remember to auto-rotate; agent does, but composite cells, slip thumbnails, admin previews, or any future consumer can silently render sideways | `services/image-storage.ts` | Pick one convention (bake at ingest, like web) | **S** |
| **BUG-7 [verified]** | **No job claiming on `next-job`.** Pure SELECT of `status='queued'`; two pollers can both fetch the same job before either calls `/start`. This is live config today: virtual printers ON + a real agent exists (currently parked *because* of this) | `routes/agent-api.ts` | Atomic claim: `UPDATE … SET status='claimed' WHERE id=(SELECT … FOR UPDATE SKIP LOCKED) RETURNING` | **S–M** |
| **BUG-8** | **Webhook fulfilment not transactional.** Payonify handler updates `payments` row, then (separately) `markOrderPaid` + jobs + email. Crash between the two → retry re-runs the whole success path (idempotency rests solely on `order.status`) | `routes/web/payonify-webhook.ts` | Wrap payment+order update in one transaction | **S** |
| **BUG-9** | **`mark-paid` admin endpoint: inline Basic auth, non-constant-time compare, no rate limit** — inconsistent with the session auth everywhere else; password brute-forceable | `routes/payment-webhooks.ts:128` | Move to `requireFullAdmin` session auth | **S** |
| **BUG-10** | **Multi-frame inputs accepted silently.** HEIF/WebP (and TIFF multi-page) accepted; only the first frame survives processing — customer gets an unexpected print | `image-storage.ts` supported formats | Detect `pages > 1` and warn/reject | **S** |
| **BUG-11** | **Extract-window edge cases unguarded.** `edit-applier.ts` and agent `composite-renderer.ts` compute crop/extract rects with rounding and call `.extract()` without bounds-clamping; extreme aspect ratios or crop x→1.0 can throw Sharp "bad extract area" and fail the job | `edit-applier.ts`, agent `composite-renderer.ts` | Clamp `left/top` to `dim - size` | **S** |

### Medium

| # | Finding | Where | Effort |
|---|---|---|---|
| BUG-12 | No CSRF tokens; cookie auth + `sameSite=lax`. Top-level navigations carry the session (the GET logout *relies* on this by design). State-changing POSTs are protected by lax, but the model is one config change away from broken; no `Origin` checking | `index.ts` session config, all `web/*` routes | M |
| BUG-13 | No rate limiting anywhere (login, signup, webhooks, admin) — brute force and flood-DoS feasible; bot-probe 404 noise already visible in prod logs | global | S (`@fastify/rate-limit` on auth + webhooks) |
| BUG-14 | Upload limits inconsistent: web photos 50MB×1/request, upload sessions 50MB×200/session (10GB potential); no per-session total cap; no explicit `limitInputPixels` (Sharp's ~268MP default is the only pixel-bomb guard) | `upload.ts`, `web/photos.ts` | S |
| BUG-15 | JPEG output settings differ: editor renders `quality 92, 4:4:4 chroma`; composite sheets `quality 95, mozjpeg` default 4:2:0 chroma — visible quality mismatch on the same photo across products | `edit-applier.ts` vs agent `composite-renderer.ts` | S |
| BUG-16 | `fontconfig` registration uses module-level flag + `process.env.FONTCONFIG_FILE` write; concurrent first-renders could race → slips fall back to Georgia (this exact symptom was seen historically) | `utils/fonts.ts` | S (register at boot) |
| BUG-17 | Webhook verify-token logged verbatim on mismatch (`{ mode, token }`) — secret in logs | `whatsapp-webhook.ts` GET verify | S |
| BUG-18 | Composite cell lookup falls back to array position (`cells.find(...cellIndex) ?? cells[i]`) — out-of-order/missing cells print in wrong positions instead of failing loudly | agent `composite-renderer.ts` | S |
| BUG-19 | Pending-payment orders never expire — abandoned checkouts accumulate as `pending_payment` forever; bot context can also reference an order later cancelled by admin | `services/order.ts` | S (timeout sweep → `cancelled`) |

### Low

| # | Finding | Where |
|---|---|---|
| BUG-20 | Agent API key compared with `!==` (not timing-safe); long random key makes this theoretical | `agent-api.ts` |
| BUG-21 | Payonify timestamp magnitude heuristic (s/ms/µs/ns boundaries) is sound for real values but undocumented; replay window depends on it | `services/payonify.ts` |
| BUG-22 | Virtual printers + Payonify both on in prod is a footgun pairing (sim "prints" paid orders with no output); code only logs, doesn't prevent | `index.ts` startup |
| BUG-23 | Mini-print pan rounding can be 1px asymmetric (cosmetic) | agent `composite-renderer.ts` |
| BUG-24 | EXIF rotate + per-cell rotate + sheet `printRotation` interplay is correct *by design* today (cells are web-baked; bot composites carry no transform), but nothing asserts those assumptions | agent `composite-renderer.ts` |

---

## 4. BRAND RULE COMPLIANCE

### Violations

| # | Rule | Finding | Severity / Effort |
|---|---|---|---|
| **BRAND-1 [verified]** | No "Innovative Fusions"/"GIZMO" on customer pages; no location refs | **Upload page footer (customer-facing):** `A venture by <a href="https://gizmotechstore.co.zw">Innovative Fusions</a> · Harare, Zimbabwe` — three banned items in one line | **Critical brand** / S — `routes/upload.ts:514` |
| **BRAND-2 [verified]** | No em dashes in customer copy | **35 literal em dashes in `src/bot/messages.ts`** (price lines, upload prompts, etc.). Web app pages also contain em dashes in customer copy (`app/checkout/page.tsx`, `app/prints/*/page.tsx`, `app/layout.tsx` metadata, composite product/editor components, among others) | High / S–M (sweep + rewrite) |
| **BRAND-3** | No location references in copy | "FusionPrints HRE" in the pickup + out-for-delivery WhatsApp notifications (`services/order.ts`) and on the thermal envelope label (`slip-renderer.ts:358`); "Harare, Zimbabwe" upload footer (BRAND-1); env defaults `BUSINESS_ADDRESS='Harare, Zimbabwe'`, `COLLECTION_ADDRESS='Collection address TBD, Harare'` | Medium / S |
| **BRAND-4 (flag for founder)** | Location refs | Bot fulfillment copy names Harare as a *delivery zone* ("Deliver in Harare — $3.00", "🚚 Harare delivery", "your delivery address in Harare", `messages.ts:268–282`). This is functional zone language, not flavor copy — needs a founder ruling rather than blind removal | Decision / S |

### Clean

- **Printer names** (Epson/DNP/Canon/SureColor/DS620/P900): zero occurrences in customer-facing strings (admin + agent internals only). ✔
- **Discount language**: zero customer-facing discount/%-off/save copy (consistent with bulk discounts being turned off; note the *code* tiers remain, commented for re-enable). ✔
- **The three locked promise lines** — verified **verbatim-identical** in both places they appear:
  - "We print it ourselves. Every single one."
  - "Blink and it's ready."
  - "Ordering a print shouldn't feel like filing taxes."
  - Locations: `app/page.tsx` (promise strip) and `app/prints/page.tsx` (with the `// Locked promise copy (WEB-SESSION-BRIEFING.md) — used verbatim.` marker). No drifted variants found. ✔

---

## 5. UNFINISHED WORK

### TODOs (all of them)

| File:line | TODO |
|---|---|
| `src/services/payment.ts:98` | Stripe Checkout integration (bot card payment returns a fake URL today) |
| `src/bot/handler.ts:155` | "replace with real Stripe Checkout session creation" |
| `src/routes/payment-webhooks.ts:84` | verify Magetsi signature "once we have the spec" (endpoint live — BUG-2) |
| `src/routes/payment-webhooks.ts:117` | verify Stripe signature (stub endpoint) |
| `src/routes/whatsapp-webhook.ts:376` | update payment status from WhatsApp message-status callbacks |

### Half-built features

| Feature | State |
|---|---|
| **Bot card payment** | Stub: replies "Switching to card payment…" then a placeholder pay URL. Either wire Payonify card (charges or hosted link) or remove the option from the menu |
| **WhatsApp templates (24h-window fix)** | Code shipped + env-gated (`WHATSAPP_TEMPLATE_PICKUP/DELIVERY`); pickup template submitted to 360dialog, **awaiting approval**; delivery template **not yet submitted**; both env vars unset → still free-form sends |
| **Thermal envelope labels** | Full ZPL pipeline exists end-to-end but is `UNVERIFIED until the thermal printer is installed` (agent comment); `THERMAL_PRINTER_NAME` blank |
| **Magetsi / Stripe providers** | Commented-out request blocks preserved in `payment.ts` / `payment-webhooks.ts`; enum values (`paynow`, `flutterwave`) exist in DB with no implementation |
| **Dropbox import** | `.env.example` has `DROPBOX_APP_KEY=`; zero code references |
| **Google Photos import** | Fully built; gated off by default (`GOOGLE_PHOTOS_IMPORT_ENABLED`) |
| **Referral system** | Promo-slip referral card exists; no referral tracking/redemption mechanics |
| **Legacy `ready_for_collection`** | Enum value + an admin button branch retained for back-compat only |
| **Bulk discounts** | Tiers zeroed with the original values commented in place for re-enable (`catalog.ts:445`); cart/checkout UI has no discount line if re-enabled (charged ≠ displayed — the bug class already hit once) |

### Env vars referenced in code but absent from `.env.example` (backend)

`PAYONIFY_PUBLISHABLE_KEY`, `PAYONIFY_SECRET_KEY`, `PAYONIFY_WEBHOOK_SECRET`, `MAGETSI_API_BASE`, `MAGETSI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `QBO_CLIENT_ID/SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID`, `WHATSAPP_TEMPLATE_PICKUP/DELIVERY/LANG`, `WHATSAPP_WEBHOOK_USER/PASS`, `WEB_SESSION_SECRET`, `OPERATOR_USERNAME/PASSWORD`, `BEELINK_AUTOLOGIN_TOKEN`, `VIRTUAL_PRINTERS`, `VIRTUAL_PRINT_MS`, `VIRTUAL_POLL_MS`. Inverse: `DROPBOX_APP_KEY` documented but unused. (Effort: S to sync.)

Web repo: `NEXT_PUBLIC_PAYONIFY_PUBLISHABLE_KEY` and `NEXT_PUBLIC_API_URL` have no `.env.example` at all.

---

## 6. IMPROVEMENT AREAS

| # | Area | Specifics | Severity / Effort |
|---|---|---|---|
| **IMP-1** | **Zero automated tests in all three repos.** `npm test` = "No tests yet"; no runner installed anywhere. Highest-value targets, in order: (1) `pricing.calculateQuote` (money), (2) bot state-machine transitions incl. reset/BACK/cancel paths, (3) `payonify.verifyWebhookSignature` (fraud guard), (4) web↔agent cell-fit parity (property test with shared fixtures — the lockstep comment currently *is* the test), (5) edit-payload schema acceptance/rejection | **Critical gap** / L (start S with pricing + signature) |
| IMP-2 | **Admin UI as template literals in route files.** `admin-ops.ts` is 1,567 lines mixing SQL, auth, business logic, HTML and inline JS; `admin-dashboard.ts` 498. Every admin change risks the whole file; nothing is unit-testable | High / M–L (extract services first: `markShipped`, `reprintJob`, stats queries) |
| IMP-3 | **Catalog duplicated backend↔web.** `config/catalog.ts` vs `lib/composite-products.ts` — compared field-by-field: **currently in sync** (prices, cells, borders), but nothing enforces it; a backend layout tweak silently breaks web previews | Medium / M (serve layouts via the catalog API or generate a shared JSON) |
| IMP-4 | **Parity-critical math duplicated** (acknowledged in comments): web `cell-fit.ts` ↔ agent `composite-renderer.ts`, and `edit-payload` schema mirrored backend↔web. Verified identical today; only convention protects it | Medium / S (shared fixture test in CI) |
| IMP-5 | **~20 `await import()` calls** working around circular deps (handler→order→whatsapp→…), incl. inside hot paths like notifications. Obscures the dependency graph | Medium / M |
| IMP-6 | **Swallowed errors.** Justified best-effort catches exist, but: web photo **delete** failures vanish (`.catch(() => {})` → UI says deleted, photo returns on refresh) — `app/account/photos/page.tsx:144,154`; several backend `.catch(() => {})` don't even log (`sendWebOrderConfirmation` call sites) | Medium / S |
| IMP-7 | **No `unhandledRejection`/`uncaughtException` handlers in the backend** (the agent has them). A stray rejection can leave the process in a bad state without the systemd restart it should get | Medium / S |
| IMP-8 | **Money events under-logged.** Payment initiation/failure logs omit amounts; reconciliation requires DB queries. (Payment success/order-paid logging is decent) | Medium / S |
| IMP-9 | **PII in logs.** Phone numbers logged routinely at info (handler, notifications, waitlist). Fine while logs stay in journald; becomes exposure the day logs ship to a SaaS. Pino redaction is one serializer away | Low–Medium / S |
| IMP-10 | **404 scanner noise** floods `journalctl` (bots probing `/.env`, `/owa`, `/docker-compose.yml`, observed live during this audit) making real errors hard to spot | Low / S (filter noise paths from warn-logging) |
| IMP-11 | **Deploy script gaps** (`scripts/deploy.sh`): no migration-failure rollback story, single un-retried health verification, no `npm ci` timeout. Acceptable single-instance, worth hardening | Low–Medium / S |
| IMP-12 | **Single-instance assumptions baked in:** price overrides mutate the in-memory PRODUCTS array (a second instance would serve stale prices); bot state has no cross-instance story. Fine today; document as a hard constraint or fix before any horizontal scaling | Medium (deferred) / M |
| IMP-13 | **Backups unverified.** No Postgres backup tooling in-repo; B2 has no replication; `qbo-tokens.json` lives un-backed-up on the app box. Confirm Hetzner snapshot/pg_dump cadence and test a restore | Medium / S to verify |
| IMP-14 | **Sequential, guessable order numbers** (`FP-YYYY-NNNN`) combine badly with BUG-2/BUG-9 style endpoints; consider opaque public references for anything unauthenticated | Low / M |

---

## Top 10 actions by risk-per-effort (no fixes applied in this audit)

1. **BUG-1** Gate mock `/confirm` to `provider === 'virtual'` (S) — closes a pay-nothing exploit.
2. **BUG-3** Set `WHATSAPP_WEBHOOK_USER/PASS` (+verify token) on prod (S) — closes open bot injection.
3. **BUG-2** Disable or secret-gate `/webhook/payment/ecocash` until Magetsi is real (S).
4. **BRAND-1** Remove the Innovative Fusions/GIZMO/Harare footer from the upload page (S).
5. **BUG-7** Atomic job claiming (`FOR UPDATE SKIP LOCKED`) (S–M) — also unblocks running real agent + simulator safely.
6. **BUG-5** Guard greeting-reset against mid-payment context loss (S–M).
7. **BUG-4** Serialize per-customer bot message handling (M).
8. **IMP-1** First tests: pricing + Payonify signature + cell-fit parity (S to start).
9. **BUG-6** Bake EXIF at WhatsApp ingest (S).
10. **BRAND-2** Em-dash sweep of `messages.ts` + web customer copy (S–M).

*End of audit. No code, schema, or config was modified during this pass.*
