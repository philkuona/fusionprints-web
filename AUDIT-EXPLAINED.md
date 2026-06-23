# FusionPrints Audit — Plain-Language Explanations

Companion to `AUDIT.md` (the findings) and `REMEDIATION-PLAN.md` (the fix plan). This file explains **every action item in plain language**: what it actually is, a concrete story of how it goes wrong, what it costs, and what the fix does. Read this first; use `AUDIT.md` for the file:line evidence and `REMEDIATION-PLAN.md` for sequencing. Nothing has been changed — these are explanations only.

---

## THE CRITICALS — each is "someone gets something for nothing"

### BUG-1 — The mock payment confirm works on real orders

**What it is:** Before Payonify, the web checkout used a fake "Approve payment" step. That endpoint (`POST /web/api/checkout/FP-xxx/confirm`) still exists — and it doesn't check *which* payment provider the order used. It only checks "is this your order, and is it unpaid?" If yes, it marks it paid.

**The story:** A customer adds $50 of prints, gets to the Payonify modal, and closes it without paying. They open the browser dev tools (or just know the URL pattern) and send `{"outcome":"success"}` to the confirm endpoint. Our backend says "great, paid!", queues the print jobs, sends the confirmation email. The prints get made. **You were never paid.** They didn't hack anything — they used an endpoint we left on.

**Implication:** direct revenue loss, invisible until you reconcile Payonify's dashboard against fulfilled orders and notice money missing.

**The fix:** one guard — confirm only works if the order's payment provider is `virtual` (dev/test mode). Real-gateway orders can *only* be marked paid by Payonify's cryptographically signed webhook.

---

### BUG-2 — Anyone can mark any order "paid" via the old EcoCash webhook

**What it is:** A leftover endpoint from the planned Magetsi integration: `POST /webhook/payment/ecocash`. Built before the security spec existed, so it trusts whatever it's sent — no signature, no secret. Live on prod right now.

**The story:** Your order numbers are sequential — `FP-2026-0019`, `FP-2026-0020`… An attacker (or a "clever" customer) places an order, notes their number, guesses the neighbours, then:
```
curl -X POST https://api.fusionprints.co.zw/webhook/payment/ecocash \
  -d '{"reference":"FP-2026-0021","status":"success","transaction_id":"fake"}'
```
Order 0021 — someone else's unpaid order, or their own — flips to paid. Jobs queue. Worse than BUG-1 because **no login is needed at all**; anyone on the internet can do it.

**The fix:** the endpoint returns 404 unless Magetsi is genuinely configured (it isn't, and won't be soon). When Magetsi ever happens, it ships *with* signature verification.

---

### BUG-3 — The WhatsApp webhook is wide open on prod

**What it is:** When a customer messages your bot, 360dialog forwards the message to `POST /webhook/whatsapp`. The code *supports* protecting that endpoint with a username/password — but on prod **those env vars are empty** (verified live). So the endpoint accepts a POST from anyone, and there's no way to tell a real 360dialog delivery from a forgery.

**The story:** Anyone who finds the URL can POST a fake "incoming WhatsApp message" claiming to be from *any phone number*. They can impersonate a real customer mid-order (type "CANCEL" as them, change their order), or — nastier — walk the bot to the EcoCash step and trigger a **USSD payment push to a victim's phone**: the victim gets an "Enter PIN to pay FusionPrints $22" prompt out of nowhere. Even if no one pays, it's harassment with your brand on it. It's also a free DoS lever: flood fake messages, the bot burns 360dialog fees replying to ghosts.

**The fix (config, not code):** set the webhook username/password on prod, and update the 360dialog dashboard so its webhook calls carry those credentials. Two changes, **same sitting** — do one without the other and real messages get rejected and the bot goes silent until both match (that's the "quiet moment" flagged in the plan).

---

### BUG-4 — Two fast messages can corrupt a customer's cart

**What it is:** The bot's memory of each conversation (which step you're on, what's in your cart) is one database row. Handling a message is: **read** the row → **think** → **write** it back. No lock. If two messages from the same person are processed at once, both read the same starting state, and whoever writes last **erases the other's work**.

**The story:** A customer at "Add another item or checkout?" quickly taps "1" then "2" (people double-tap on bad connections; WhatsApp also redelivers on retries). Handler A processes "add another"; handler B processes "checkout" — both starting from the same snapshot. B finishes first and moves them to checkout. Then A finishes and writes "still adding items" over it. The customer is now frozen in the wrong step — or an item vanishes — or the EcoCash effect fires **twice** (two payment pushes for one order).

**Implication:** rare, random, impossible-to-reproduce support tickets ("the bot ate my order").

**The fix:** a per-customer lock — while one message for customer X is processing, a second for X waits its turn. Milliseconds of delay, total elimination of the race.

---

## THE HIGHS — wrong behavior, lost orders, wrong prints

### BUG-5 — Typing "Hi" mid-payment nukes the order

**What it is:** Words like HI / HELLO / MENU / RESTART reset the bot to a blank slate from *any* step — including while a payment is in flight.

**The story:** A customer at "enter your EcoCash PIN" gets confused and types "Hi" to get the bot's attention. The bot wipes their cart, order number, everything, and shows the main menu. Their order `FP-2026-0042` still exists as unpaid — but *they* have no record of the number and the bot has forgotten it. If the EcoCash push went through seconds later, you now have a **paid order the customer can't see and never confirmed**. Support call guaranteed.

**The fix:** if there's a cart or live order, "Hi" gets a gentle "You have an order in progress (FP-2026-0042) — reply CONTINUE or RESTART" instead of silently torching it.

---

### BUG-6 — WhatsApp photos keep their "rotation sticker" instead of being truly rotated

**What it is:** Phone photos are often stored sideways with an EXIF tag saying "display me rotated 90°". Software must honor the tag. Our **web** uploads physically rotate the pixels on arrival (stored file is simply upright). Our **WhatsApp** uploads don't — they store the sideways pixels + the tag, trusting every downstream consumer to remember it.

**The story:** Today the print agent remembers, so prints are fine. But many things read that image: composite cells, slip thumbnails, the admin order preview, any future feature. The first one written without the magic `.rotate()` call shows the customer's baby photo **sideways** — and in a composite, prints it sideways across 4 wallet cells. We've already had a whole class of "preview ≠ print" pain; this is a standing landmine of the same type.

**The fix:** rotate-on-arrival for WhatsApp images too, same as web. One convention everywhere: stored pixels are always upright.

---

### BUG-7 — Two printers can grab the same job

**What it is:** When an agent asks "any work for me?", the backend *looks up* the next queued job and hands it over — but doesn't mark it taken. Two askers polling at the same moment **both get the same job**.

**The story:** Not hypothetical — it's your *current topology*. Virtual printers are ON (prod testing) and the real agent exists on the mini PC. We parked the real agent precisely because if both ran, a paid order's job could be claimed by both: the simulator marks it "done" (no output) while the DNP also prints it — or two physical copies print, or status updates fight. It also blocks the obvious future (a second DNP, a backup agent).

**The fix:** make handing out a job atomic — "give me the next job AND mark it mine, in one database operation" (`FOR UPDATE SKIP LOCKED` — Postgres has this exact tool). After this, virtual + real can safely coexist, which also simplifies testing.

---

### BUG-8 — A crash mid-webhook can double-fire the "order paid" routine

**What it is:** When Payonify says "payment succeeded", we do several writes in sequence: update the payment row, mark the order paid, queue jobs, send the email. They're **not wrapped in a transaction**. If the process dies between steps, Payonify retries the webhook (by design), and the retry re-runs from the top.

**The story:** Server restarts at the worst millisecond (deploys do this). Payment row says success, order still says pending. Retry arrives → passes the "is it pending?" check → marks paid again → queues jobs again → **second confirmation email**, possibly duplicate slips. The guards mostly hold, but by luck of ordering, not by construction.

**The fix:** wrap the money-state writes in one transaction — all land or none do; retries become true no-ops.

---

### BUG-9 — The "mark paid" admin endpoint has its own weak lock

**What it is:** Every admin endpoint uses your session login — except one: the manual "mark this order paid" endpoint, which accepts just a password in a header, compares it character-by-character (timing-leaky), and has **no rate limit**.

**The story:** A bot scripts ten thousand password guesses an hour against it — nothing slows it down, nothing alerts you. The prize for guessing is the single most valuable action in the system: marking arbitrary orders paid.

**The fix:** use the same session login as every other admin endpoint (one small change), plus the global rate limiting in Phase 3.

---

### BUG-10 — Animated/multi-frame images print only frame 1

**What it is:** We accept animated WebP and multi-frame HEIF (Apple Live Photos), but every processing step quietly keeps only the **first frame**.

**The story:** A customer uploads a Live Photo; frame 1 is often the blurry pre-shot. They get a print of a photo they never chose, and nothing errored.

**The fix:** detect multi-frame input and either reject with a friendly "send a still photo" or warn.

---

### BUG-11 — Crop math can ask for pixels that don't exist

**What it is:** Crop and cell windows are computed with rounding. At extremes (crop dragged fully to an edge; a panorama into a tiny passport cell), the computed window can land **1px outside the image** — Sharp throws "bad extract area" and the whole print job fails with a cryptic error.

**The fix:** clamp the window to the image bounds before extracting. One line per call site; converts a hard failure into an imperceptible 1px shift.

---

## MEDIUMS — weaknesses that need a second ingredient to hurt

- **BUG-12 — No CSRF protection.** Your web session is a cookie. `sameSite=lax` blocks most cross-site abuse *today*, but there are no CSRF tokens and no Origin checks — protection is one config tweak or browser quirk from gone. *Example:* a malicious page auto-submitting a form to a state-changing endpoint while a customer is logged in. **Fix:** check the `Origin` header on state-changing routes.
- **BUG-13 — No rate limiting anywhere.** Unlimited login guesses, webhook spam, signups. Prod logs already show bots probing (`/.env`, `/owa`…). One `@fastify/rate-limit` plugin tightens all of it.
- **BUG-14 — Upload limits uneven.** A bot upload session allows 200 files × 50MB = **10GB per session** to B2 (you pay storage). No explicit cap on image *pixel dimensions*, so a tiny crafted file that decompresses to a giant image can balloon memory ("pixel bomb"); Sharp's default cap is the only guard. **Fix:** session total cap + explicit pixel limit.
- **BUG-15 — Composites compress color differently than editor prints.** Single-photo pipeline outputs full-quality color (4:4:4 chroma); the composite sheet renderer uses the lossier default (4:2:0). Same photo as a 4×6 vs in a wallet set can show subtly worse color edges in the wallet. One parameter to match.
- **BUG-16 — Font setup can race on first use.** Brand fonts register lazily on the first slip render via a global flag — two simultaneous first-renders can interleave and the loser falls back to Georgia. That Georgia-slip symptom has *already happened once*. **Fix:** register fonts once at server startup.
- **BUG-17 — A secret in your logs.** When webhook verification fails, the code logs the *expected verify token* itself. Logs aren't a vault. **Fix:** log a hash prefix instead.
- **BUG-18 — Composite cells fall back to "guess by position".** If cell data arrives missing its index, the renderer silently uses array order — a wrong-order payload prints photos **in the wrong cells** instead of failing loudly. With per-cell photos (wallet with 4 different people), that's the wrong faces in the wrong frames. **Fix:** fail the job with a clear error.
- **BUG-19 — Abandoned checkouts live forever.** Every "got to payment, walked away" order sits as `pending_payment` permanently — admin clutter, rows forever, and a stale order an old webhook or the mock confirm could resurrect days later. **Fix:** auto-cancel after e.g. 24h (your call on the window).

---

## LOWS — note-and-move-on

- **BUG-20:** agent API key compared non-constant-time — theoretical timing attack; long key makes it impractical.
- **BUG-21:** Payonify's nanosecond-timestamp handling works but the unit-guessing thresholds deserve a comment.
- **BUG-22:** virtual printers + real payments is a footgun *pairing* (paid order "prints" with no output) — exactly your current test setup; fine while deliberate, must flip before launch.
- **BUG-23:** mini-print pan can be 1px off-center. Invisible.
- **BUG-24:** rotation layering in composites is correct today *by assumption* (cells are pre-rotated web images) — nothing asserts it. A test, not a fix.

---

## BRAND ITEMS

- **BRAND-1 — the upload page footer.** Customers doing bot web-uploads see, verbatim: *"A venture by Innovative Fusions · Harare, Zimbabwe"*, linking to gizmotechstore.co.zw. Banned brand names AND a location reference on a customer page, in one line. Pure deletion.
- **BRAND-2 — em dashes.** Rule: none in customer copy. The bot has **35** ("4 × 6 — $0.46 each"); several web pages have more. Rewrites are easy ("4 × 6 at $0.46 each") — but it's *copy*, so you'll get the full before/after list to approve rather than me freelancing your voice.
- **BRAND-3 — "FusionPrints HRE" and friends.** The pickup/delivery WhatsApp messages and the envelope label say "FusionPrints HRE"; env defaults say "Harare, Zimbabwe". Move all naming to env config so the code carries no location.
- **BRAND-4 — needs your ruling.** The bot's delivery options must distinguish zones: "Deliver in Harare — $3.00" vs outside. That's *functional* geography, not flavor copy. Keep, generalize ("Local delivery"), or make zone names configurable — your call; not assumed.
- **Compliant:** no printer names anywhere customer-facing, no discount language, and the three locked promise lines are verbatim-identical everywhere they appear.

---

## DATA LAYER

- **Dev DB drift.** Prod matches the code's schema *exactly* (verified column-by-column live). But your **dev database is missing two tables** (`site_visits`, `waitlist`) because migrations 0004–0008 were partly hand-written during a tooling hiccup, and the migration journal can't tell. Implication: "works in dev" and "works in prod" can quietly diverge; a fresh database built from the migrations is *not* guaranteed complete. **Fix:** rebuild dev from scratch once + add an automated schema-diff check so this drift can't recur silently.
- **Unbounded tables.** `site_visits` (every landing hit, forever), `payments`, `print_jobs`, `slip_jobs`, expired `upload_sessions` — none ever deleted. Not urgent at your volume, but a slow leak: a year out, the analytics table dwarfs your business data and queries/backups slow. Also: the **image-cleanup job is in dry-run on prod** — it logs what it *would* delete but deletes nothing, so B2 storage only grows. **Fix:** simple scheduled sweeps + deliberately flipping dry-run off.
- **Unvalidated JSON blobs.** The bot's cart, composite cell layouts, and slip payloads are stored as raw JSON with no validation — the printed product depends on their exact shape, but nothing checks it. A future code change that subtly alters the shape corrupts orders silently. **Fix:** Zod-validate on write/read for the load-bearing ones.

---

## IMPROVEMENTS (the "why" in one breath each)

- **IMP-1 Zero tests** — your money math (`calculateQuote`), the webhook signature check, and the preview↔print parity math have **no safety net**; any refactor can silently change prices or break fraud protection. Start with those three: small effort, maximum protection.
- **IMP-2 Admin pages are 1,500-line strings** — every admin tweak risks the whole file; nothing is testable. Extract the logic first, pretty it later.
- **IMP-3/4 Duplicated truths** — product layouts exist in two repos, parity math in two repos. They match *today* (diffed); only discipline keeps it so. A shared source or a parity test makes drift impossible instead of unlikely.
- **IMP-5 ~20 lazy imports** hide the real dependency graph — it works, it's just archaeology for the next person.
- **IMP-6 Swallowed errors** — e.g. deleting a photo on the web can fail silently: UI says gone, photo's back after refresh. Tell the user; log the rest.
- **IMP-7 No crash handlers in the backend** — an unhandled async error can wound the process without killing it (zombie state). The agent already does this right; copy it.
- **IMP-8/9/10 Logging** — payment failures don't log amounts (reconciliation pain), phone numbers are logged freely (fine until logs ever leave the server), and bot-scanner 404s drown real errors.
- **IMP-11 Deploy script** — no rollback story if a migration fails halfway; small hardening.
- **IMP-12 Single-instance assumptions** — admin price changes mutate in-process memory; a second backend instance would serve old prices. Fine now, documented landmine for scaling.
- **IMP-13 Backups unverified** — no backup tooling found in-repo; if the Hetzner box dies, what survives? A 30-minute verification, possibly nothing more.
- **IMP-14 Sequential order numbers** — `FP-2026-0042` makes every "guess an order" attack (BUG-2/9) easier; opaque public references remove that multiplier.

---

*Explanations only — no code, schema, or config was changed. See `REMEDIATION-PLAN.md` for the phased fix sequence and the seven decisions needed from you.*
