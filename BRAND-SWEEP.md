# Phase 2B — Brand Sweep (for review, nothing applied)

Proposed rewrites for **customer-facing** strings only. Code comments are excluded (the rule doesn't cover them). Approve as-is, edit any line, or reject. On your "go" I apply the approved set verbatim, typecheck, and deploy (backend) / push (web).

Two things need an explicit decision before I can finish: **BRAND-4** (Harare delivery-zone wording) and the **printed-slip separators** — both flagged below.

---

## A. Em-dash rewrites — WhatsApp bot (`src/bot/messages.ts`)

Rule applied: em dash → colon / comma / period / "at", whichever reads cleanest. Bold/emoji preserved.

| Line | Before (excerpt) | After (excerpt) |
|---|---|---|
| 65 | `${label} — *$${price}*` | `${label}: *$${price}*` |
| 97 | `${label} — *$${price}*${note}` | `${label}: *$${price}*${note}` |
| 133 | `*${label}* — ${price} each.` … `*One photo* — multiple copies` … `*A few photos* — send as documents` … `*Many photos* — fast upload via web link` | `*${label}* at ${price} each.` … `*One photo*: multiple copies` … `*A few photos*: send as documents` … `*Many photos*: fast upload via web link` |
| 137 | `*${label}* — ${price} each.` | `*${label}* at ${price} each.` |
| 148 | `*${label}* — ${price} each.` … `Upload as many as you like — fast, works on any browser.` | `*${label}* at ${price} each.` … `Upload as many as you like. Fast, works on any browser.` |
| 167 | `✅ Got it — ${count} photo… added` | `✅ Got it! ${count} photo… added` |
| 170 | `…for *${label}* — ${price} each.` … `Send them as *documents* — you can select all` | `…for *${label}* at ${price} each.` … `Send them as *documents*. You can select all` |
| 174 | `📷 Photo ${count} received — ${w}×${h}px _(slightly low res — acceptable…)_` | `📷 Photo ${count} received: ${w}×${h}px _(slightly low res, acceptable…)_` |
| 184 | `That image is ${w}×${h}px — below the ${min} minimum.` | `That image is ${w}×${h}px, below the ${min} minimum.` |
| 190 | `✅ Added: ${n} × ${label} — *${total}*` | `✅ Added: ${n} × ${label} for *${total}*` |
| 193 | `*${label}* — ${price} each.` … `not a regular photo — WhatsApp shrinks` | `*${label}* at ${price} each.` … `not a regular photo, since WhatsApp shrinks` |
| 198 | `${w}×${h} pixels — below the minimum ${min}.` | `${w}×${h} pixels, below the minimum ${min}.` |
| 204 | `✅ Got it — ${w}×${h}px, looking good.` | `✅ Got it! ${w}×${h}px, looking good.` |
| 212 | `*${name}* — ${price}.` … `not a regular photo — WhatsApp shrinks those` | `*${name}* at ${price}.` … `not a regular photo, since WhatsApp shrinks those` |
| 216 | `*${name}* — ${price}.` | `*${name}* at ${price}.` |
| 220 | `Lovely — now send your *second* photo` | `Lovely! Now send your *second* photo` |
| 226 | `That image is ${w}×${h}px — below the ${min} minimum.` | `That image is ${w}×${h}px, below the ${min} minimum.` |
| 235 | `✅ Added: ${qty} × ${label} — *$${total}*` | `✅ Added: ${qty} × ${label} for *$${total}*` |
| 239 | `✅ Added: ${qty} × ${label} — *$${total}*` | `✅ Added: ${qty} × ${label} for *$${total}*` |
| 261 | `One quick thing — what's your name?` | `One quick thing: what's your name?` |
| 315 | `*Order ${n}* created — total *$${total}*` | `*Order ${n}* created. Total: *$${total}*` |
| 328 | `must be EcoNet — 077 or 078` | `must be EcoNet: 077 or 078` |
| 332 | `isn't on EcoNet — EcoCash only works with EcoNet numbers` | `isn't on EcoNet. EcoCash only works with EcoNet numbers` |
| 361 | `Order *${n}* — your poster will go through a quick quality check` | `Order *${n}*: your poster will go through a quick quality check` |
| 366 | `Bring your phone — show this message when you collect.` | `Bring your phone and show this message when you collect.` |
| 380 | `*Print photos* — type *photos*` (×4 list items) | `*Print photos*: type *photos*` (×4) |
| 382 | `This is FusionPrints' ordering chat — for help, please call us on…` | `This is FusionPrints' ordering chat. For help, please call us on…` |

*(Lines 268/272 also have em dashes but they're the Harare delivery-zone copy — handled in section D so we resolve wording + em dash together.)*

## B. Em-dash rewrites — bot status labels (`src/bot/handler.ts`)

| Line | Before | After |
|---|---|---|
| 120 | `paid: 'paid — printing soon'` | `paid: 'paid, printing soon'` |
| 126 | `fulfilled: 'collected — complete'` | `fulfilled: 'collected, complete'` |
| 128 | `failed: 'failed — please contact us'` | `failed: 'failed, please contact us'` |

## C. Em-dash rewrites — web frontend

| File:line | Before | After |
|---|---|---|
| `app/layout.tsx:32/39/43/47` | `${SITE_NAME} — Hold the moment.` | `${SITE_NAME}. Hold the moment.` *(matches the homepage metadata title, which already uses the period form)* |
| `app/prints/passport/page.tsx:7` | `…on one sheet — upload once, we lay them out.` | `…on one sheet. Upload once, we lay them out.` |
| `app/prints/wallet/page.tsx:7` | `…4×6 sheet — design and order online.` | `…4×6 sheet. Design and order online.` |
| `app/prints/mini/page.tsx:7` | `…on one sheet — design and order online.` | `…on one sheet. Design and order online.` |
| `app/checkout/payment/page.tsx:128` | `No charge was made — please try again.` | `No charge was made. Please try again.` |
| `app/checkout/page.tsx:163` | `Pick your country &mdash; we print for customers anywhere.` | `Pick your country and we print for customers anywhere.` |
| `components/composite-editor/composite-product-view.tsx:33` (alt text) | `${name} — ${tagline}` | `${name}: ${tagline}` |

*(All other web em-dash hits from the scan are `{/* … */}` JSX/JS comments — excluded.)*

## D. Printed slip separators — **DECISION NEEDED**

These render on the **physical** dye-sub cards the customer receives (`src/services/slip-renderer.ts`):
- `:168` centered divider: `— ORDER START —`
- `:247` centered footer: `— ${orderNumber} · END —`

These are decorative typographic dividers, not sentence copy. Options:
1. **Keep** (treat as design element, not "copy").
2. **Swap the em dashes for middots** to honour the rule strictly: `· ORDER START ·` and `· ${orderNumber} · END ·`.
3. Something else you prefer.

My lean: **option 2** (cheap, keeps the look, satisfies the rule). Your call.

---

## E. Location references

| Where | Current | Proposed | Notes |
|---|---|---|---|
| `slip-renderer.ts:358` (printed envelope label) | `FusionPrints HRE` | `FusionPrints` via new `BUSINESS_DISPLAY_NAME` env (default `FusionPrints`) | "HRE" is gratuitous location branding |
| `order.ts:727` (pickup WhatsApp msg) | `Pick up at *FusionPrints HRE* …` | `Pick up at *${BUSINESS_DISPLAY_NAME}* …` | drops "HRE"; **keeps `📍 ${BUSINESS_ADDRESS}`** — see below |
| `order.ts:775` (out-for-delivery msg) | `left *FusionPrints HRE* …` | `left *${BUSINESS_DISPLAY_NAME}* …` | drops "HRE" |
| `messages.ts:19` collection-address default | `'Collection address TBD, Harare'` | code default → `'our shop'`; set real `BUSINESS_COLLECTION_ADDRESS` in prod env | prod env is **unset** today, so the "TBD, Harare" placeholder is actually showing to customers |
| `env.ts:28/30` defaults | `BUSINESS_ADDRESS='Harare, Zimbabwe'`, `BUSINESS_LOCATION_NAME='Harare'` | neutralize defaults (e.g. `''`) | prod overrides `BUSINESS_ADDRESS` with the real street address, so defaults only matter if unset — low priority |

**Recommended KEEP (with rationale) — confirm you agree:**
- **The pickup address** (`📍 ${BUSINESS_ADDRESS}` = your real Harare street address) in the "your order is ready" message. The customer needs it to collect — this is operational, not marketing flavour. Removing it would break pickups.
- **"Zimbabwean mobile number"** (`messages.ts:336`) — a phone-format helper, not a location pin.
- **"Outside Zimbabwe? Pick your country…"** (`checkout.ts:163`) — international-customer helper (we keep the country reference, just remove the `&mdash;`).

---

## D-bis. Harare delivery zones — **DECISION NEEDED (BRAND-4)**

Functional zone naming, in two places:
- **Bot** (`messages.ts:268/272/275/276/280/282`): "Deliver in Harare — $3.00", "Deliver outside Harare", button "🚚 Harare delivery", "Outside Harare", "send your delivery address in Harare", "For deliveries outside Harare…".
- **Web** (`app/checkout/page.tsx:24–26,282`): zone labels "Harare CBD" / "Greater Harare" / "Outside Harare (quoted)", and "Delivery outside Harare is quoted separately."

Three options:
1. **Keep** — it's functional geography customers need to pick the right delivery option. (Then I only fix the em dashes in those lines.)
2. **Generalize** — "Local delivery — $3.00", "Wider area — $5.00", "Further out — quoted." Loses the precision that helps customers self-select.
3. **Make zone names configurable** via env, defaulting to neutral labels — most work, most flexible.

My lean: **option 1** (keep) — these are delivery options, not brand flavour, and customers genuinely need to know the zones to choose. But it's your brand rule, so it's your call. Whatever you pick, the em dashes in those exact lines get fixed in the same edit.

---

## What happens on approval

1. You tell me: (a) any line edits, (b) the **slip-separator** choice (D), (c) the **Harare-zone** ruling (D-bis).
2. I apply the approved rewrites across `messages.ts`, `handler.ts`, `slip-renderer.ts`, `order.ts`, `env.ts` (backend) and the web files; introduce `BUSINESS_DISPLAY_NAME` (env, default "FusionPrints"); set the real `BUSINESS_COLLECTION_ADDRESS` on prod env.
3. Typecheck → backend deploy + web push.
4. Verify: `grep -P "\x{2014}"` returns zero customer-facing hits; spot-check a bot message + the homepage title.

*No code, copy, or config has been changed by this document.*
