"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only performance HUD for the Phase 2.2 editor GATE. Renders ONLY when the
 * URL has `?perf` (e.g. /editor/<id>?perf=1), so it never ships to customers.
 *
 * Measures the two signals the Konva-vs-Pintura decision rides on:
 *  - FPS (continuous + a 5-second low watermark) → reflects pan/zoom smoothness.
 *  - Slider → preview latency: time from a range-input event to two frames later
 *    (a proxy for "the colour preview has repainted"); reports last + p95.
 * Plus WebGL availability and devicePixelRatio for context. Read the numbers off
 * a real budget Android (via a real-device cloud) against the gate criteria:
 * slider p95 > 100ms, FPS < ~30, or WebGL unavailable → consider Pintura.
 */
export function PerfOverlay() {
  const [on, setOn] = useState(false);
  const [fps, setFps] = useState(0);
  const [minFps, setMinFps] = useState(0);
  const [lat, setLat] = useState({ last: 0, p95: 0, n: 0 });
  const [info, setInfo] = useState({ webgl: "…", dpr: 1 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!new URLSearchParams(window.location.search).has("perf")) return;

    // WebGL availability (informational — live preview currently uses CSS filters)
    let webgl = "none";
    try {
      const c = document.createElement("canvas");
      if (c.getContext("webgl2")) webgl = "webgl2";
      else if (c.getContext("webgl")) webgl = "webgl1";
    } catch {
      webgl = "none";
    }

    // FPS meter + 5s low watermark
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let acc = 0;
    let minWindow = Infinity;
    let minMark = last;
    let started = false;
    const loop = (t: number) => {
      // Flip on + publish static info on the first frame (not synchronously in
      // the effect body) so the HUD mounts cleanly.
      if (!started) {
        started = true;
        setOn(true);
        setInfo({ webgl, dpr: window.devicePixelRatio || 1 });
      }
      const dt = t - last;
      last = t;
      frames++;
      acc += dt;
      if (dt > 0) minWindow = Math.min(minWindow, 1000 / dt);
      if (acc >= 500) {
        setFps(Math.round((frames * 1000) / acc));
        frames = 0;
        acc = 0;
      }
      if (t - minMark >= 5000) {
        setMinFps(minWindow === Infinity ? 0 : Math.round(minWindow));
        minWindow = Infinity;
        minMark = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Slider → preview latency (capture range inputs anywhere in the editor)
    const samples: number[] = [];
    const onInput = (e: Event) => {
      const tgt = e.target;
      if (!(tgt instanceof HTMLInputElement) || tgt.type !== "range") return;
      const start = performance.now();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const l = performance.now() - start;
          samples.push(l);
          if (samples.length > 80) samples.shift();
          const sorted = [...samples].sort((a, b) => a - b);
          const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? l;
          setLat({ last: Math.round(l), p95: Math.round(p95), n: samples.length });
        }),
      );
    };
    document.addEventListener("input", onInput, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("input", onInput, true);
    };
  }, []);

  if (!on) return null;

  const tone = (bad: boolean) => (bad ? "text-coral" : "text-malachite");
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[100] select-none rounded-lg bg-black/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-white shadow-lg">
      <div className="mb-1 font-bold text-malachite">PERF · gate</div>
      <div>
        fps <span className={tone(fps > 0 && fps < 30)}>{fps}</span>
        {"  "}min5s <span className={tone(minFps > 0 && minFps < 30)}>{minFps || "…"}</span>
      </div>
      <div>
        slider p95 <span className={tone(lat.p95 > 100)}>{lat.p95}ms</span>
        <span className="text-white/60">
          {" "}(last {lat.last}ms · n{lat.n})
        </span>
      </div>
      <div className="text-white/60">
        webgl {info.webgl} · dpr {info.dpr}
      </div>
    </div>
  );
}
