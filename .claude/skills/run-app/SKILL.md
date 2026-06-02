---
name: run-app
description: "Launch the fusionprints-web Next.js dev server and capture page screenshots at desktop and mobile widths. Use when asked to run the app, screenshot a page, or visually verify a UI change in the real browser (not just typecheck/build). WSL-specific: drives the Windows Edge/Chrome binary in headless mode."
---

# Run & screenshot fusionprints-web

This repo runs under **WSL2**. There is no Linux browser installed and no
Playwright/Puppeteer — screenshots are taken by invoking the **Windows**
Edge (or Chrome) binary in headless mode. This recipe is verified working.

## 1. Start the dev server

```bash
cd /home/tinashe/dev/fusionprints-web
nohup npm run dev > /tmp/devserver.log 2>&1 &
# poll until ready (usually <2s with Turbopack)
for i in $(seq 1 30); do
  [ "$(curl -s -m 3 -o /dev/null -w '%{http_code}' http://localhost:3000/)" = "200" ] \
    && { echo "READY"; break; }
  sleep 1
done
tail -5 /tmp/devserver.log
```

Server listens on `http://localhost:3000`. WSL `localhost` is reachable from
the Windows browser binary, so no IP juggling is needed.

## 2. Capture screenshots (Windows Edge headless)

Edge writes to the **Windows** filesystem, so screenshot paths must be
Windows-style (`C:\...`); read them back from the `/mnt/c/...` mount.

```bash
EDGE="/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
# Fallback: CHROME="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
OUT="/mnt/c/temp/fpshots"; WOUT='C:\temp\fpshots'
mkdir -p "$OUT"

shoot () { # name url width height
  "$EDGE" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=$3,$4 \
    --screenshot="$WOUT\\$1.png" "$2" >/dev/null 2>&1
  echo "$1 -> $(ls -la "$OUT/$1.png" | awk '{print $5}') bytes"
}

# Desktop 1440x900, mobile 390x844 (iPhone-class). These are the REAL
# above-the-fold viewports — do NOT pass a giant height (e.g. 4200) or
# vh-based hero sections (min-h-[88vh]) balloon and the capture lies.
shoot home_desktop  http://localhost:3000/             1440 900
shoot how_desktop   http://localhost:3000/how-it-works 1440 900
shoot about_desktop http://localhost:3000/about        1440 900
shoot home_mobile   http://localhost:3000/             390  844
shoot how_mobile    http://localhost:3000/how-it-works 390  844
shoot about_mobile  http://localhost:3000/about        390  844
```

Then **look at each one** with the Read tool (e.g. `Read /mnt/c/temp/fpshots/home_desktop.png`).
A blank/empty frame means the page failed to render — that's a failure, not a pass.
Run all Bash/Edge steps with `dangerouslyDisableSandbox: true` (WSL→Windows exec).

## 3. Stop the server when done

```bash
pkill -f "next dev"; pkill -f "next-server"
curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://localhost:3000/ || echo "down (good)"
```

## Notes & gotchas

- **`/prints` needs the backend.** It server-fetches the catalog from the
  Fastify backend (`~/dev/fusionprints`). Without that running you'll see
  `Failed to fetch catalog` / `GET /web/api/catalog 404`. The static
  marketing pages (`/`, `/how-it-works`, `/about`) render standalone.
- **Full-page capture:** Edge headless captures only the window viewport,
  not the full scroll height. To see lower sections, either raise the
  height deliberately (knowing vh sections will stretch) or capture at
  realistic height and accept it's above-the-fold only.
- **For a quick non-visual smoke check**, `npm run typecheck && npm run lint
  && npm run build` is faster and needs no browser.
