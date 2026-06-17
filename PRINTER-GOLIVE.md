# Printer Go-Live Runbook

Remote runbook for bringing the **DNP DS620A** (dye-sub) and **Epson SureColor P5300**
(inkjet) printers online when the hardware arrives.

- **Mini-PC** (print agent): Windows box, reached via **AnyDesk**. Repo at
  `C:\Users\Fusion Prints\dev\fusionprints-agent` (note the space). Runs as the NSSM
  service **`FusionPrintsAgent`** (`run-agent.bat` → `node dist\index.js`). Logs:
  `C:\FusionPrints\logs\agent-out.log` / `agent-err.log`.
- **Prod backend**: Hetzner, SSH `fusionprints@178.104.67.122`, app at `/home/fusionprints/app`.
- **Web**: Vercel (auto-deploys on push to `main`).

> Last updated 2026-06-17. As of now: code is **committed but UNPUSHED** (backend `1791229`,
> agent `7086db7`) and **not deployed**; the mini-PC has offline queues **`FP5300`** (Epson P5300)
> and **`FPDS620A`** (DNP DS620A) — both drivers installed, no hardware yet. Mini-PC `.env` still
> names the old P900 and the old DNP name.

The names that must always agree, per printer:
- inkjet: **`.env` `EPSON_PRINTER_NAME`** == **Windows queue `FP5300`** == **prod DB `os_printer_name`**.
- dye-sub: **`.env` `DNP_PRINTER_NAME`** == **Windows queue `FPDS620A`** == **prod DB `os_printer_name`**.
`FP5300` and `FPDS620A` are the permanent queue names — keep them.

---

## Phase 1 — Physical + Windows queues (mini-PC via AnyDesk)

1. Power both printers, connect to the mini-PC (USB or network), load media
   (DNP: 6×8 ribbon + media; P5300: 17in luster roll or sheets).
2. **DNP**: driver installed and queue created as **`FPDS620A`**. Just point it at the printer's
   port when the hardware arrives. `.env` `DNP_PRINTER_NAME` must equal `FPDS620A`.
3. **P5300**: repoint the **existing `FP5300` queue** to the real printer's port
   (Printer properties → Ports). **Keep the name `FP5300`.**
4. Confirm both online:
   ```powershell
   Set-Location "C:\Users\Fusion Prints\dev\fusionprints-agent"
   npm run test-printers      # both FPDS620A + FP5300 should show online
   ```
5. If the P5300 driver reports different paper-size names than expected, re-enumerate and fix
   `EPSON_PAPER_SIZES` in `src/printer-driver.ts`. Expected native sizes:
   `8 x 10 in`, `11 x 14 in`, `12 x 18 in` (= "ARCH B 12 x 18 in"), `16 x 20 in`.
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $pd = New-Object System.Drawing.Printing.PrintDocument
   $pd.PrinterSettings.PrinterName = 'FP5300'
   $pd.PrinterSettings.PaperSizes |
     Select PaperName, @{n='W';e={[math]::Round($_.Width/100,2)}}, @{n='H';e={[math]::Round($_.Height/100,2)}} |
     Sort W | Format-Table -Auto
   ```

## Phase 2 — Deploy the code

From the dev machine (WSL):
```bash
cd ~/dev/fusionprints       && git push        # backend → 1791229
cd ~/dev/fusionprints-agent && git push        # agent   → 7086db7
cd ~/dev/fusionprints       && npm run deploy   # deploy backend
```
`deploy.sh` prints "✓ Migrations applied / ✓ Service restarted" **unconditionally** — verify directly:
```bash
ssh fusionprints@178.104.67.122 'cd app && git rev-parse HEAD'    # == 1791229
curl -s https://api.fusionprints.co.zw/health                     # {"status":"ok","database":"connected"}
```

On the mini-PC (PowerShell as Administrator):
```powershell
Set-Location "C:\Users\Fusion Prints\dev\fusionprints-agent"
Stop-Service FusionPrintsAgent
git fetch origin; git reset --hard origin/main; git log --oneline -1   # == 7086db7
npm install; npm run build                                            # build REQUIRED (runs dist/)
```
Then edit `.env` so both queue names match Windows:
```
DNP_PRINTER_NAME=FPDS620A
EPSON_PRINTER_NAME=FP5300
```
Start and verify polling:
```powershell
Start-Service FusionPrintsAgent; Get-Service FusionPrintsAgent
Get-Content "C:\FusionPrints\logs\agent-out.log" -Tail 30   # NOT *.log (merges stale crash logs)
```
Startup log should read `DNP DS620A: online` and `Epson P5300: online`.

## Phase 3 — Verify alignment

Confirm the DB rows and that heartbeats flipped status to online:
```bash
ssh fusionprints@178.104.67.122 'cd app && DBURL=$(grep -E "^DATABASE_URL=" .env|head -1|cut -d= -f2-); \
  psql "$DBURL" -c "SELECT name, os_printer_name, status, last_heartbeat_at FROM printers ORDER BY printer_type;"'
```

## Phase 4 — Test prints (the real validation)

Place a real test order per path, approve it, confirm the agent picks it up and prints at the
correct size/colour with **no cropping**.
- **DNP** sizes: 4×6, 5×7, 6×6, 6×8.
- **Inkjet (P5300)** sizes: **8×10, 11×14, 12×18, 16×20** — verify **each** (this exercises the
  `EPSON_PAPER_SIZES` map). An `Epson P5300 does not support size: <code>` error means the driver
  PaperName didn't match → go back to Phase 1, step 5.
- Thermal envelope-label printer is separate (`THERMAL_PRINTER_NAME`, currently unset → disabled);
  only wire it if/when that printer is installed.

## Phase 5 — Launch toggles

- Confirm `VIRTUAL_PRINTERS=false` on prod (set 2026-06-16). With it off, jobs complete only via
  the real agent + powered printers.
- `WHATSAPP_TEMPLATE_PICKUP` is unset on prod → pickup template never fires. Set it if pickup
  notifications are wanted at launch.

## Rollback / gotchas

- The shipped commits are cleanup/display-only and revert cleanly. Prefer reverting the specific
  commit over hard-resetting prod to an older tip.
- mini-PC: old May-22 "Cannot find module 'C:\Users\Fusion'" lines in the logs are **stale**
  (unquoted-path crashes), not current. Read `agent-out.log` directly, not `*.log`.
- prod `fusionprints` user has passwordless sudo for `systemctl` only (not journalctl/postgres).
  DB access = `psql` with `DATABASE_URL` from `.env` (don't `. .env` — one line has an unquoted space).
