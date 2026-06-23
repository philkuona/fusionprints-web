# FusionPrints — Dead Code & Redundancy Audit

**Date:** 2026-06-16
**Scope:** all three code repos — `fusionprints-web` (Next.js), `fusionprints` (backend), `fusionprints-agent` (print agent).
**Goal:** find code that serves no purpose to the running system — unused files/exports/deps, unreachable code, dead env vars, redundant/duplicate logic, orphaned scripts.
**Method:** per-repo `knip` + `ts-prune` + `depcheck`, with **every** tool candidate manually grep-verified (tools produce many false positives — symbols "used in module", entry points, dynamic refs). No code was modified. This is analysis only.

**Removal-risk legend:**
- **Safe** — grep-verified zero references; removing it changes nothing observable.
- **Review** — likely removable, but it's a feature-gap, future scaffolding, or coupled to a dev script — decide intent first.
- **Leave** — intentional (drift-guard mirror, provider scaffolding, hidden-but-deliberate path). Do **not** remove.

---

## TL;DR — genuinely dead, safe to remove now

These are zero-reference, High-confidence, non-destructive. ~Quick wins:

**Web (`fusionprints-web`)**
- `components/catalog/product-card.tsx` — whole file (`ProductCard` never imported). ⚠️ removing it also makes `aspectRatioPct` in `lib/.../sizes.ts` dead — remove both together.
- `lib/edit/crop-math.check.ts` — whole file (hand-rolled assertions superseded by the vitest suite).
- `zod` dependency (`package.json`) — never imported.
- Unused exports: `logout` (`lib/api/auth.ts:64`), `formatFileSize` (`lib/api/photos.ts:109`), `cartSubtotal` (`lib/cart.ts:78`), `compositeBySlug` (`lib/composite-products.ts:134`), `resLevelForPhoto` (`lib/editor/resolution.ts:35`).
- Unused exported types: `ProductType`, `Finish` (`lib/api/catalog.ts:10-11`), `CheckoutItem`, `OrderItemDetail` (`lib/api/orders.ts:16,65`), `CompositeLayout` (`lib/composite-products.ts:17`).

**Backend (`fusionprints`)**
- Deps: `node-quickbooks`, `pino-pretty` (`package.json`) — never imported (QBO uses raw fetch). `@types/bcryptjs` — redundant (`bcryptjs@3` ships its own types).
- Unused exports (zero refs incl. tests/scripts): `formatUnitPrice` (`services/pricing.ts:310`), `isConnected` (`services/qbo.ts:73`), `resetConversationState` (`services/conversation-state.ts:84`), `detectCompression` + `ImageQuality` type (`services/image-validation.ts:136,13`).

**Print agent (`fusionprints-agent`)**
- `sendPrinterHeartbeat` (`src/api-client.ts:173`) + `PrinterStatus` type (`:76`) — exported, never called; the advertised heartbeat endpoint is never used (status reported via job start/done/fail instead).
- Whitespace-only remnants at `src/agent.ts:159,175` (cosmetic).

---

## Web frontend (fusionprints-web)

| # | Category | Path:line | What & why | Conf. | Risk |
|---|----------|-----------|------------|-------|------|
| 1 | Unused file | `components/catalog/product-card.tsx` | `ProductCard` exported, never imported. Whole file dead. Drags `aspectRatioPct` (sizes.ts) with it. | High | Safe |
| 2 | Orphaned file | `lib/edit/crop-math.check.ts` | Hand-rolled node assertions ("no test framework yet"), not imported, not a vitest test, not in package scripts. Superseded. | High | Safe |
| 3 | Unused dep | `package.json` `zod` | Never imported (knip + depcheck agree). | High | Safe |
| 4 | Unused export | `lib/api/auth.ts:64` `logout` | Never called; only `logoutUrl` is used. | High | Safe |
| 5 | Unused export | `lib/api/photos.ts:109` `formatFileSize` | Zero callers. | High | Safe |
| 6 | Unused export | `lib/cart.ts:78` `cartSubtotal` | Zero callers; pages compute totals themselves. | High | Safe |
| 7 | Unused export | `lib/composite-products.ts:134` `compositeBySlug` | Zero callers. | High | Safe |
| 8 | Unused export | `lib/editor/resolution.ts:35` `resLevelForPhoto` | Zero callers; only `resLevelForArea` used. | High | Safe |
| 9–13 | Unused exported types | `lib/api/catalog.ts:10-11` (`ProductType`,`Finish`); `lib/api/orders.ts:16,65` (`CheckoutItem`,`OrderItemDetail`); `lib/composite-products.ts:17` (`CompositeLayout`) | Exported types, no external references. | High/Med | Safe |
| — | Secrets note (not dead code) | `.env.local:6` | A Payonify `pk_test_…` publishable key is committed. Publishable keys are low-risk, but `.env.local` shouldn't be tracked. | High | Review |

**Confirmed NOT dead (false positives ruled out):** `scripts/gen-*.mjs` (Gemini imagery ops tooling, whitelisted in settings), `app/styleguide/page.tsx` (route, blocked from indexing), Payonify checkout (intentional dual-provider behind `PAYONIFY_PUBLISHABLE_KEY`), Tailwind v4 / React type devDeps, and many "used in module" exports.

---

## Backend (fusionprints)

| # | Category | Path:line | What & why | Conf. | Risk |
|---|----------|-----------|------------|-------|------|
| 1 | Unused dep | `package.json` `node-quickbooks` | QBO uses raw `fetch`; package imported nowhere. | High | Safe |
| 2 | Unused dep | `package.json` `pino-pretty` | No transport wired. | High | Safe |
| 3 | Unused devDep | `package.json` `@types/bcryptjs` | `bcryptjs@3` ships own types. | High | Safe |
| 4 | Unused dep | `package.json` `@aws-sdk/lib-storage` | Only `client-s3` + presigner used. | High | Review (no streamed-multipart path planned?) |
| 5 | Dead env var | `config/env.ts:121` `WEB_SESSION_SECRET` | Comment claims a fallback, but never read — `index.ts:108` uses `ADMIN_SESSION_SECRET` directly. Dead + misleading comment. | High | Review |
| 6 | Dead env var / feature gap | `config/env.ts:49` `WHATSAPP_TEMPLATE_DELIVERY` | Only `WHATSAPP_TEMPLATE_PICKUP` is read (`order.ts:734-746`). Delivery-template path never wired. | High | Review (feature gap) |
| 7 | Unused env vars | `config/env.ts:53-60` Paynow/Flutterwave keys | Never read; superseded by Payonify. | High | Leave (future-ZW-gateway scaffolding) |
| 8 | Unused env vars | `config/env.ts:104,106-107` `MAGETSI_API_BASE`, Stripe keys | Never read (Stripe path stub-only). | High | Leave (provider scaffolding) |
| 9 | Unused env vars | `config/env.ts:38,43` `WHATSAPP_BSP`, `WHATSAPP_WABA_ID` | Declared, never read. | Med | Review |
| 10 | Dead export | `services/payment.ts:93` `createCardCheckoutUrl` | Zero callers; contains the unreachable Stripe stub. | High | Leave (intentional hidden card path) |
| 11 | Dead export | `services/pricing.ts:310` `formatUnitPrice` | Zero refs. | High | Safe |
| 12 | Dead export | `services/qbo.ts:73` `isConnected` | Zero refs. | High | Safe |
| 13 | Dead export | `services/conversation-state.ts:84` `resetConversationState` | Zero refs. | High | Safe |
| 14 | Dead export | `services/image-validation.ts:136,13` `detectCompression` + `ImageQuality` | Zero refs. | High | Safe |
| 15–16 | Redundant `export` keyword | `utils/phone.ts` (`normalizeZimMobile`,`identifyNetwork`,`ZimNetwork`); plus `order.ts:364`, `image-storage.ts:88`, `upload.ts:41`, `pricing.ts:92`, `data-retention.ts:19`, `edit-applier.ts:22,32`, `edit-payload.ts:20,28` | Symbols live but used only in-module — `export` is unnecessary. Not dead code. | High | Safe (cosmetic) |
| 17 | Orphaned scripts | `scripts/{test-b2,test-pricing,test-d2-slips,preview-slips,verify-user,upload-test-promos,seed-test-campaign,notify-waitlist}.ts` | Not in package scripts/CI/deploy/docs. Manual dev utilities. | Med | Review |
| 18 | Dead-if-#17-pruned | `image-storage.ts:556` `testB2Connection`; `pricing.ts:72,288` `getBulkDiscountPercent`,`formatPriceList`; `slip-renderer.ts:92,207` `buildOrderInfoSvg`,`buildEndSeparatorSvg` | Only callers are the orphaned scripts in #17. | Med | Review (tied to #17) |
| 19 | Catalog mirror | `config/catalog.ts` (`COMPOSITE_PRODUCTS`, `isComposite`, `IN_HOUSE_PRODUCTS`, `getTargetPrinterType`, `BORDER_PRESETS`, `DEFAULT_COMPOSITE_EDITOR`) | Not imported in backend; part of catalog single-source + drift-guard mirror. | Med | Leave |
| 20 | Stale provider TODOs | `payment-webhooks.ts:94,124`; `bot/handler.ts:159`; `whatsapp-webhook.ts:379` | Stub bodies for non-live providers; reachable only under non-deployed `PAYMENT_PROVIDER`. | Med | Leave (scaffolding) |
| — | Minor | `eslint.config.js` uses `@eslint/js` not in deps | Trivial missing-dep gap (not dead code). | High | Review |

---

## Print agent (fusionprints-agent)

| # | Category | Path:line | What & why | Conf. | Risk |
|---|----------|-----------|------------|-------|------|
| 1 | Dead export | `src/api-client.ts:173` `sendPrinterHeartbeat` | Exported, never called; heartbeat endpoint never used (status via job start/done/fail). | High | Safe |
| 2 | Dead export type | `src/api-client.ts:76` `PrinterStatus` | Only referenced by the dead #1. | High | Safe |
| 3 | Orphaned script | `scripts/test-b2-download.ts` | One-off B2 diagnostic; not in package scripts/README/imports; hardcodes `fusionprints_dev`. | High | Review |
| 4 | Duplicate logic | `scripts/test-b2-download.ts:20-46` | Verbatim copy of `downloadFromB2()` (`image-processor.ts:53-90`) instead of calling it. Dies with #3. | High | Review |
| 5 | Cosmetic remnant | `src/agent.ts:159,175` | Whitespace-only lines where logic was removed. | Med | Safe |
| 6 | Redundant `export` (NOT dead) | `printer-driver.ts:144,182,257` | `printOnDNP/Epson/printThermalLabel` called internally by `dispatchPrintJob`. Only `export` is redundant. | High | Leave |
| 7 | False positive | `api-client.ts:21` `CompositeLayoutCell` | Used in-module. | High | Leave |
| 8 | Parity mirror | `composite-renderer.ts:55-96` `CellWindow`/`computeCellWindow` | Deliberately-mirrored cell-fit math pinned by `tests/cell-fit-parity.test.ts`. | High | Leave |

**Also noted:** several `PrintJob` wire fields are received-but-unread (`printerId`, `printerOsName`, `orderItemId`, `customerName`, `isPreRendered`, `sequencePosition`) — these are the backend job contract, not dead code (leave). Zero unused deps, zero unused env vars, zero TODO/commented-dead blocks. README ops scripts (`test-printers`, `install-service`, `uninstall-service`) and `test-job` are operational.

---

## Cross-cutting observations

1. **The biggest theme is unused single-module `export` keywords**, not true dead code — dozens of symbols are flagged by tooling but are used within their own file. Dropping the `export` is cosmetic and low value; don't churn the diff for it.
2. **Provider scaffolding is deliberate.** Paynow/Flutterwave/Magetsi/Stripe env vars + stub handlers exist for future ZW gateways (Payonify is the live one). Leave them; they're documented intent, not rot.
3. **The catalog + cell-fit parity duplication across all three repos is a drift-guard, not redundancy** — pinned by parity tests. Removing it would be destructive.
4. **Two findings are more than dead code — they're latent feature gaps:** `WHATSAPP_TEMPLATE_DELIVERY` (delivery-notification template never wired) and `WEB_SESSION_SECRET` (claims a fallback that doesn't exist). Decide whether to *wire* or *delete*.
5. **Secrets hygiene (out of scope but flagged):** `.env.local` with a Payonify `pk_test_…` key is tracked in the web repo.

## Suggested cleanup batches (if/when you act — each is independently verifiable with typecheck + tests)
- **Batch A (zero-risk deletes):** web items #1–13, backend deps #1–3, backend dead exports #11–14, agent #1–2 + #5. Run `tsc` + vitest in each repo after.
- **Batch B (decide intent):** `WEB_SESSION_SECRET`, `WHATSAPP_TEMPLATE_DELIVERY`, `@aws-sdk/lib-storage`, orphaned dev scripts (#17/#18 backend, #3/#4 agent).
- **Batch C (leave):** all provider scaffolding, catalog/parity mirrors, hidden card path, redundant-export-keyword items.

*End of audit pass. (Findings above were report-only; Batch A was actioned separately — see below.)*

---

## Batch A — APPLIED 2026-06-16 (branch `chore/dead-code-batch-a` in each repo; committed, NOT pushed)

Each repo's deletions were grep-verified, then gated on `tsc --noEmit` + vitest. The gates caught **three false positives** in the tables above — they are used **within their own module** (redundant `export` keyword only, NOT dead):
- Web types `ProductType`, `Finish`, `CheckoutItem`, `OrderItemDetail`, `CompositeLayout` → live in-module field types. **Kept.**
- Backend `pino-pretty` → live: `utils/logger.ts:28` loads it by name as a pino `transport.target` (a runtime string the tools can't see). **Kept.**
- Backend `ImageQuality` type → live (type of `ImageValidationResult.quality`); only `detectCompression` was dead. **Kept.**

**Removed & verified green:**
- **web** `689e5b7` — `components/catalog/product-card.tsx`, `aspectRatioPct` (in catalog.ts), `lib/edit/crop-math.check.ts`, `zod` dep, exports `logout`/`formatFileSize`/`cartSubtotal`/`compositeBySlug`/`resLevelForPhoto`. → tsc clean, 13 tests pass.
- **backend** `081c251` — deps `node-quickbooks`, `@types/bcryptjs`; exports `formatUnitPrice`/`isConnected`/`resetConversationState`/`detectCompression`. → tsc clean, 93 tests pass.
- **agent** `dca7287` — `sendPrinterHeartbeat` + `PrinterStatus`, whitespace remnants in `agent.ts`. → tsc clean, 11 tests pass.

**Newly orphaned (left in place, follow-up candidate):** web `fitFrame` (`lib/edit/crop-math.ts`) — its only consumer was the deleted check file.

Branches are local only — not pushed, no PRs opened yet.

