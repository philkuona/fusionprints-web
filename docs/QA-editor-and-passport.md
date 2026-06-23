# QA Test Guide — Web Editor Unification + Passport Stub

Manual walkthrough for the web changes:
- **PR #13** (`feat/editor-composite-merge`) — wallet & mini in the main editor.
- **PR #12** (`stub/passport-web`) — passport hidden.

Run on the deployed web app (app.fusionprints.co.zw) signed in as a test
customer. Tick **Pass/Fail** and note anything off.

## A. Wallet & Mini in the main editor

### 1. Cards appear in the editor
1. Open the editor (`/editor/new`) with at least one photo in your strip.
2. In the size sidebar (desktop) look for a **Photo sets** group with **Wallet Prints** and **Mini Prints** cards, each showing a price. ▢ Pass ▢ Fail
3. On mobile, tap the size/product selector → the bottom sheet shows the same Wallet/Mini under **Photo sets**. ▢ Pass ▢ Fail

### 2. Wallet — one photo, four-up
1. Click the **Wallet Prints** card.
2. **Expected:** The editor switches to a Wallet surface in the same shell (top bar reads "Design your Wallet Prints"). The preview is a 4×6 sheet with **four** 2×3 cells and dashed cut guides. ▢ Pass ▢ Fail
3. There is a **single** "Add a photo" control — NOT four upload slots and no "use this photo for all cells" button. ▢ Pass ▢ Fail
4. Add one photo (upload or "Choose from My Photos"). **Expected:** the same photo fills all four cells. ▢ Pass ▢ Fail
5. Drag / zoom the photo. **Expected:** all four cells update together. ▢ Pass ▢ Fail
6. Pick a border preset. **Expected:** preview updates. ▢ Pass ▢ Fail
7. "Add to cart · $2.50" → lands in `/cart` with a Wallet line item. ▢ Pass ▢ Fail

### 3. Mini — two distinct photos
1. From the Wallet surface, click **Mini Prints** in the sidebar (or open `/editor/new?product=mini`).
2. **Expected:** Mini surface; preview is a sheet with **two** 3×4 cells; a **Photos** selector with two slots (1, 2). ▢ Pass ▢ Fail
3. Try **Add to cart** with only one photo. **Expected:** blocked with "Add a photo to every cell first." ▢ Pass ▢ Fail
4. Add a different photo to slot 1 and slot 2. **Expected:** each cell shows its own photo. ▢ Pass ▢ Fail
5. Toggle layout **Side by side / Stacked**. **Expected:** the sheet re-flows (landscape vs stacked). ▢ Pass ▢ Fail
6. "Add to cart · $2.00" → `/cart` shows a Mini line item. ▢ Pass ▢ Fail

### 4. Switching products resets cleanly
1. In composite mode, add a photo to Wallet, then switch to Mini via the sidebar.
2. **Expected:** Mini starts empty (no carry-over from Wallet); switching back to Wallet also starts fresh. ▢ Pass ▢ Fail

### 5. Back to standard prints
1. From a composite surface, click **← Print sizes** (top bar) or **Photo prints & wall art** (sidebar).
2. **Expected:** You return to the standard single-photo editor with your photo strip intact. ▢ Pass ▢ Fail

### 6. Deep links & product pages
1. Visit `/editor/new?product=wallet` directly → opens in Wallet mode. ▢ Pass ▢ Fail
2. Visit `/editor/new?product=mini` → Mini mode. ▢ Pass ▢ Fail
3. Visit `/prints/wallet` → product page; **Start designing** opens the editor in Wallet mode. ▢ Pass ▢ Fail
4. Visit `/prints/wallet/create` and `/prints/mini/create` directly → **redirect** into the editor (no old separate editor). ▢ Pass ▢ Fail

### 7. Checkout a composite order end-to-end
1. With a Wallet (and/or Mini) item in the cart, complete checkout (collection or delivery).
2. **Expected:** Order places successfully; no "composite cell is missing its photo" or image errors; the order total reflects the composite price(s). ▢ Pass ▢ Fail

### 8. Standard flow regression
1. Add a normal print (e.g. 5×7) via the editor: crop, finish, quantity, add to cart, checkout.
2. **Expected:** Unchanged — the single-photo flow still works exactly as before. ▢ Pass ▢ Fail

## B. Passport stubbed (PR #12)

### 9. Passport hidden across the site
1. Home page **Photo sets** section: shows Wallet & Mini only, **no Passport** card. ▢ Pass ▢ Fail
2. Top nav "Photo Prints" dropdown: no **Passport Photos** entry. ▢ Pass ▢ Fail
3. In the editor's Photo sets cards: no Passport. ▢ Pass ▢ Fail
4. Visit `/prints/passport` and `/prints/passport/create` directly → **redirect to `/prints`** (no checkout path). ▢ Pass ▢ Fail

---

**Defect log**

| # | What happened | Expected | Severity | Fixed? |
|---|---------------|----------|----------|--------|
|   |               |          |          |        |
