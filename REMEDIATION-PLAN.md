# FusionPrints Remediation Plan

Companion to `AUDIT.md` (2026-06-09). Item IDs (BUG-n / BRAND-n / IMP-n) refer to the audit.

**Status (2026-06-14):** Phases 1–5 implemented and pushed (backend `main`, CI green). Remaining: **BUG-3** (prod WhatsApp webhook lock — needs prod env + 360dialog dashboard), **IMP-12** (deferred until multi-instance scaling), and the prod-access half of **IMP-13** (Hetzner snapshot cadence + restore drill). Backend is pushed but **not deployed** — needs `npm run deploy` + prod `db:migrate` (migrations 0020/0021/0022); the agent repo needs a mini-PC pull/build/restart. BUG-11 and BUG-16 were false positives (already fixed pre-audit).

**Sequencing logic:** ordered by risk-per-effort, grouped into deploy batches (backend deploys are manual `npm run deploy`; web auto-deploys on push; agent needs a mini-PC pull+build+restart). Each item lists: files touched, the approach, how we verify, and rollback.

---

## Phase 0 — Same-day config hardening (no code, ~30 min total)

> Goal: close the open prod doors without waiting for a code deploy.

### 0.1 Lock the WhatsApp webhook (BUG-3) — Critical
- **Change (prod `.env`):** set `WHATSAPP_WEBHOOK_USER`, `WHATSAPP_WEBHOOK_PASS` (long random values), `WHATSAPP_WEBHOOK_VERIFY_TOKEN`. Restart service.
- **Coordination required:** 360dialog must *send* those credentials and have the registered inbound URL updated to the authenticated form (basic-auth or their auth-header setting). Do the env change and the dashboard change in the same sitting. *(Operational specifics — exact endpoint, auth form, verification commands — kept out of this committed doc; see the local ops notes.)*
- **Verify:** (1) a real inbound message still reaches the bot (auth accepted); (2) an unauthenticated inbound POST is rejected.
- **Rollback:** blank the two env vars + restart (returns to current open state).
- **Risk:** if 360dialog and env get out of sync, inbound messages 401 and the bot goes quiet — watch `journalctl` for `Webhook rejected` immediately after the switch.

### 0.2 Decide virtual-printers posture (BUG-22 context)
- No change yet (testing still depends on it), but record the rule: **VIRTUAL_PRINTERS=true and the real agent service must never run simultaneously** until BUG-7 (job claiming) ships. Currently safe because the agent is parked.

---

## Phase 1 — Critical code fixes (one backend deploy, ~half a day)

> One branch, one deploy, individually testable commits.

### 1.1 Gate the mock payment confirm (BUG-1) — Critical
- **File:** `src/routes/web/checkout.ts` (confirm handler).
- **Approach:** before acting on `outcome`, load the order's latest `payments` row; if `provider !== 'virtual'` → `409 { error: 'not_applicable' }`. (The mock confirm exists only for the virtual provider; Payonify orders are confirmed solely by the signed webhook.)
- Also remove the residual ability to *fail* a Payonify payment via this endpoint (same gate covers it).
- **Verify:** with `PAYMENT_PROVIDER=payonify` on a test order: `POST /confirm {"outcome":"success"}` → 409 and order stays `pending_payment`. With provider stub/dev: mock flow still works.
- **Test to add now (first test in repo, see Phase 4):** none blocking; manual verification acceptable for this deploy.

### 1.2 Disable the unauthenticated EcoCash webhook (BUG-2) — Critical
- **File:** `src/routes/payment-webhooks.ts`.
- **Approach:** guard the handler so it stays inert (returns 404) unless the real provider is configured *and* signature-verified; the Stripe stub gets the same guard for symmetry.
- **Verify:** an unauthenticated POST is rejected and no order changes state.

### 1.3 Remove the upload-page brand footer (BRAND-1) — Critical brand
- **File:** `src/routes/upload.ts:512–515`.
- **Approach:** delete the "A venture by … Innovative Fusions … Harare, Zimbabwe" line; keep the "Hold the moment." tagline.
- **Verify:** open an upload link, view footer.

### 1.4 Stop logging the webhook verify token (BUG-17)
- **File:** `src/routes/whatsapp-webhook.ts` (GET verify failure log).
- **Approach:** log a boolean/`tokenPresent` or an 8-char SHA-256 prefix, never the value.

### 1.5 Session-auth the admin mark-paid endpoint (BUG-9)
- **File:** `src/routes/payment-webhooks.ts:128+`.
- **Approach:** replace the inline Basic-auth block with the standard `requireFullAdmin(request, reply)` used by the rest of `/admin/api/*`.
- **Verify:** unauthenticated POST → 401; via admin session → works.

**Deploy batch 1:** commit 1.1–1.5 → `npm run deploy` → smoke: place a web test order end-to-end (Payonify test keys), one bot order, confirm exploits now blocked.

---

## Phase 2 — High-priority fixes (2–4 days, two deploy batches)

### Batch 2A — backend correctness

**2A.1 Atomic job claiming (BUG-7) — unblocks real-agent + simulator coexistence**
- **File:** `src/routes/agent-api.ts` (`next-job` for both `print_jobs` and `slip_jobs`).
- **Approach:** replace SELECT-then-return with a single claiming statement per table:
  `UPDATE print_jobs SET status='printing', started_at=now() WHERE id = (SELECT id FROM print_jobs WHERE status='queued' AND target_printer_type=$1 ORDER BY queued_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *` (drizzle `sql` raw). Keep the existing `/start` endpoint as a no-op-if-already-printing for agent compatibility (the deployed agent calls it; don't break the protocol).
  - Decision embedded: claim directly to `printing` rather than adding a new `claimed` status — avoids an enum migration and the agent already treats `/start` as idempotent intent.
  - Preserve the slip-sequencing rules (end_separator → prints → order_info) inside the claiming query's ordering.
- **Verify:** run TWO pollers against dev (virtual printers + a second curl loop) on a 10-job order: every job processed exactly once. Also verify mini composite ordering unchanged.
- **Agent impact:** none required (API shape unchanged), but after this ships, virtual + real agent may coexist safely.

**2A.2 Per-customer bot serialization (BUG-4)**
- **Files:** `src/bot/handler.ts`, `src/services/conversation-state.ts`.
- **Approach:** wrap `handleIncomingMessage` in a Postgres **advisory lock** keyed on customer UUID (`pg_advisory_xact_lock(hashtextextended(customer_id::text, 0))`) inside a transaction that spans load→process→save. Effects that call external APIs (WhatsApp send, Payonify) stay *outside* the lock where safe, but state save must commit before replies dispatch.
  - Why advisory lock over `SELECT … FOR UPDATE`: conversation_state row may not exist yet for new customers; advisory lock covers the create path too.
  - Single-instance today, but this also holds for any future second instance (same DB).
- **Verify:** scripted double-POST to the (now-authed) webhook with two rapid messages for one customer; assert final state is sequential (message 2 sees message 1's state). Add a regression note in code.

**2A.3 Greeting reset guard (BUG-5)**
- **File:** `src/bot/state-machine.ts` (RESET_WORDS gate).
- **Approach:** if a reset word arrives while context is "mid-flight" (`context.cart.length > 0` or `context.orderNumber` set, or step ∈ payment steps), do NOT clear; reply with a confirm: "You have an order in progress (FP-…). Reply CONTINUE to keep going or RESTART to discard it." Only a second explicit RESTART clears. Pure state-machine change → very testable.
- **Verify:** unit cases (Phase 4 harness) + manual bot run-through; ensure CANCEL behavior unchanged.

**2A.4 Bake EXIF at WhatsApp ingest (BUG-6)**
- **File:** `src/services/image-storage.ts` (`storeImage`).
- **Approach:** mirror `storeWebImage`: `sharp(buffer).rotate()` + re-encode before B2 upload when EXIF orientation ≠ 1 (skip re-encode when no orientation, to avoid quality loss on the common case). Update dimensions from the rotated output.
- **Note:** existing stored images keep their EXIF; the agent already auto-rotates, so no backfill needed. New uploads become orientation-safe for *every* consumer.
- **Verify:** upload a portrait phone photo via WhatsApp in dev; check stored dimensions are post-rotation; print preview/slip thumbnails upright.

**2A.5 Transactional webhook fulfilment (BUG-8)**
- **File:** `src/routes/web/payonify-webhook.ts` (+ `markOrderPaid` signature may need an optional `tx`).
- **Approach:** wrap payments-row update + order status update in one `db.transaction`; keep email/WhatsApp notification outside (best-effort after commit).

**Deploy batch 2A** → regression: full web order + full bot order + admin release flow.

### Batch 2B — brand sweep (web auto-deploys; backend in same batch as 2A or separate)

**2B.1 Em-dash sweep (BRAND-2)**
- **Files:** `src/bot/messages.ts` (35 instances) + web copy: `app/checkout/page.tsx`, `app/prints/*/page.tsx`, `app/layout.tsx` metadata, composite product/editor components, any other `app/`/`components/` hits from `grep -rn "—"`.
- **Approach:** rewrite each line replacing the em dash with a period, comma, or restructure ("4 × 6 — $0.46 each" → "4 × 6 at $0.46 each"). **Copy changes need founder sign-off** — produce the full before/after list as a diff for review *before* committing (founder approves copy, per working rules).
- **Exclusions:** code comments, admin pages, AUDIT/plan docs.

**2B.2 Location-reference cleanup (BRAND-3)**
- **Files:** `src/services/order.ts` (pickup + out-for-delivery messages: "FusionPrints HRE"), `src/services/slip-renderer.ts:358` (envelope label), `src/config/env.ts` defaults, `.env.example`.
- **Approach:** replace "FusionPrints HRE" with a `BUSINESS_DISPLAY_NAME` env (default "FusionPrints"); address/hours already come from env — set real values in prod env rather than code. Envelope label: location line driven by env or dropped.
- **Open founder decision (BRAND-4):** the Harare *delivery-zone* strings in `messages.ts:268–282` ("Deliver in Harare — $3.00", "🚚 Harare delivery", "delivery address in Harare"). Options:
  - (a) keep as-is (functional zone naming, not flavor copy),
  - (b) generalize ("Local delivery — $3.00 / Out-of-town — quoted"),
  - (c) move zone names to env/config.
  **Blocked on your call** — flagged, not assumed.

---

## Phase 3 — Medium fixes + data hygiene (3–5 days, can interleave)

### 3.1 Image-pipeline robustness (one commit each, S)
| Item | File | Change |
|---|---|---|
| BUG-11 | `services/edit-applier.ts`, agent `composite-renderer.ts` | clamp extract `left/top` to `[0, dim-size]`, `width/height` to remaining; log when clamped |
| BUG-10 | `services/image-storage.ts` | reject (or first-frame-with-warning) inputs where `metadata.pages > 1` |
| BUG-15 | agent `composite-renderer.ts` | add `chromaSubsampling: '4:4:4'` to match editor output |
| BUG-14 | `routes/upload.ts`, `web/photos.ts`, sharp call sites | per-session total-size cap (e.g. 500MB), explicit `limitInputPixels` (~80MP) on all `sharp()` entries |
| BUG-16 | `utils/fonts.ts`, `index.ts` | call `registerBrandFonts()` once at boot; keep lazy call as no-op fallback |
| BUG-18 | agent `composite-renderer.ts` | strict cell lookup: missing `cellIndex` → fail the job with a clear error (no positional fallback) |
- **Agent items require a mini-PC redeploy** (pull → `npm run build` → restart service) — bundle BUG-11/15/18 into one agent release.

### 3.2 Order lifecycle hygiene
- **BUG-19:** sweep job — `pending_payment` orders older than N hours (suggest 24h) → `cancelled`, payments row → `cancelled`. Add to the existing daily interval block in `index.ts`. **Decision needed:** N.
- **BUG-13:** `@fastify/rate-limit` — tight on `/web/api/auth/*` (e.g. 10/min/IP), moderate on webhooks, exempt agent API.
- **BUG-12:** add an `Origin`/`Referer` allowlist check on state-changing `/web/api/*` routes (cheap CSRF hardening that doesn't require token plumbing); revisit real CSRF tokens if forms ever move off fetch().

### 3.3 Data layer
- **Dev DB drift:** re-baseline dev (drop + `db:migrate` from zero, or hand-apply 0005) and add a CI step that diffs `information_schema` against the drizzle snapshot (the audit's diff script can be committed as `scripts/schema-drift-check.ts`).
- **Cleanup jobs:** `site_visits` retention (suggest 180 days — **decision needed**), `upload_sessions` daily purge of expired, automate WhatsApp-image 30-day cleanup, then **flip `IMAGE_CLEANUP_DRY_RUN=false` on prod deliberately**.
- **Indexes:** `order_items.image_id`; composite `(status, target_printer_type)` on `print_jobs` + `slip_jobs` (drizzle-kit migration).
- **.env.example sync:** add the 18 missing vars with comments; add `.env.example` to the web repo (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PAYONIFY_PUBLISHABLE_KEY`); delete `DROPBOX_APP_KEY` or mark planned.

### 3.4 Logging/ops small wins (the "2-hour list")
- Backend `process.on('unhandledRejection'/'uncaughtException')` → `logger.fatal` + exit (systemd restarts) (IMP-7).
- Amounts on payment initiate/fail logs (IMP-8).
- 404 noise filter for scanner paths (IMP-10).
- Pino redaction serializer for `phoneNumber`/`phone` fields (IMP-9).
- `.catch(() => {})` → `.catch(err => logger.error(...))` at the silent call sites; web photo-delete failure surfaces a toast + restores the tile (IMP-6).

---

## Phase 4 — Tests (start S, grows to L)

> First harness, highest-value targets only; not a coverage crusade.

1. **Harness:** Vitest in the backend (`npm i -D vitest`, `"test": "vitest run"`); plain TS, no DB needed for the first wave.
2. **Wave 1 (pure functions, ~1 day):**
   - `pricing.calculateQuote` — items/zones/rounding, discount tiers (currently 0%) snapshot.
   - `payonify.verifyWebhookSignature` — valid sig, bad sig, stale ns/ms/s timestamps, malformed header.
   - `edit-payload` schema — accept/reject matrix; verify backend and web copies are byte-identical (read both files in the test).
3. **Wave 2 (parity + state machine, ~2–3 days):**
   - **Cell-fit parity:** shared JSON fixtures (cell box, nat dims, pan/zoom/rotation) asserted against web `coverFit()` and a TS re-expression of the agent's extract math; commit fixtures to both repos. This codifies the "MUST stay in lockstep" comment.
   - **Bot state machine:** transition table tests — happy path to order, BACK at each step, CANCEL, reset-word guard (2A.3), button-id vs typed-text at wrong steps, composite flows.
4. **CI:** GitHub Action on both repos: typecheck + lint + vitest (+ schema-drift check from 3.3).

---

## Phase 5 — Structural — ✅ DONE (2026-06-14, except deferred items)

All landed on backend `main` and pushed (CI green); **not yet deployed to prod**.

| Item | Status | What shipped |
|---|---|---|
| IMP-5 dynamic imports | ✅ done (`967a667`) | Converted ~18 `await import()` to static. A cycle scan found **no** static cycles — they were defensive leftovers. Did **not** extract `notifications.ts`: those notify fns depend on `order.ts` internals, so extracting would create a new `order↔notifications` cycle. |
| tsc baseline + CI | ✅ done (`a2a5b3b`, `37e44fe`) | Cleared all type errors (src + legacy `scripts/simulate-bot*`); backend CI typecheck now **blocking, project-wide**. Caught a real latent bug: receipts read `item.displayLabel` (not an `order_items` column). |
| IMP-2 admin extraction | ✅ done (`4532a4c`) | Moved 13 data/ops fns → `services/admin-ops.ts`; route file 1,570 → 1,017 lines; ops logic now unit-testable. HTML stays in the route (second pass not done — optional). |
| IMP-14 opaque order refs | ✅ done (`f211935`) | `orders.public_ref` (10-char Crockford base32, ~50 bits), unique-indexed, backfilled (migration 0022). Rides the `Order` row type. Sequential number kept for admin/display. |
| IMP-3 catalog single-source | ✅ done (`94d16e2`) | `GET /web/api/composites` serves backend composites; `tests/composite-parity.test.ts` imports the web mirror and fails CI on geometry/price drift. (Web keeps its local copy for offline render; drift is now guarded rather than the editor data-path ripped out.) |
| IMP-11 deploy hardening | ✅ done (`a6457da`) | `timeout 300 npm ci`, real `/health` poll ×3 after restart, forward-only/no-rollback migration note. |
| IMP-13 backups (script) | ✅ done (`a6457da`) | `scripts/backup-db.ts` (`npm run backup:db`): gzipped `pg_dump` + `qbo-tokens.json` → B2, 30-day prune. **Remaining (prod access):** confirm Hetzner snapshot cadence, schedule the nightly cron, run a `pg_restore` drill. |
| Bot card payment (stub) | ✅ done — **hidden** (`0a9d402`) | Card option removed everywhere it was reachable (it generated a dead link); EcoCash-only, with a graceful "card not available" reprompt. Stub code left unreachable for when a real gateway is wired. |
| IMP-12 multi-instance prices | ⏸ deferred | Only matters at >1 instance; not started by design. |

---

## Decisions — mostly resolved during implementation

1. ✅ **BRAND-4** Harare delivery zones → resolved: configurable via `BUSINESS_LOCATION_NAME`, neutral fallback (2B).
2. ✅ **Em-dash rewrites (2B.1)** → done (brand sweep).
3. ✅ **Pending-order expiry (BUG-19)** → resolved at **24h** (Phase 3).
4. ✅ **`site_visits` retention** → resolved at **180 days** (Phase 3).
5. ✅ **Mock confirm endpoint** → gated to `provider === 'virtual'` (BUG-1); safe to keep for dev. Removing it entirely once Payonify is sole provider is still optional, not blocking.
6. ⏳ **Image cleanup `IMAGE_CLEANUP_DRY_RUN=false`** — precondition met (WhatsApp cleanup automated in Phase 3); still a deliberate **prod flag flip**.
7. ⏳ **Phase 0 / BUG-3 timing** — the 360dialog webhook credential switch (brief bot-downtime risk) is the **one remaining critical**; needs a quiet moment + prod env access.

## Suggested calendar

| When | What |
|---|---|
| Day 0 (today) | Phase 0 (config) + Phase 1 (critical code) — one deploy |
| Days 1–3 | Phase 2A (claiming, serialization, reset guard, EXIF, txn) — one deploy + agent release |
| Days 3–4 | Phase 2B brand sweep (after your copy sign-off) |
| Week 2 | Phase 3 (pipeline robustness, sweeps, indexes, env sync, ops wins) + Phase 4 wave 1 tests |
| Week 3+ | Phase 4 wave 2, Phase 5 backlog as capacity allows |

*Plan only — no changes made. Each phase lands as small reviewable commits with per-item verification as listed.*
