#!/usr/bin/env node
/**
 * FusionPrints — Gemini image generator (REST, no Python deps).
 * Usage: node scripts/gen-image.mjs <outfile.jpg> <aspect> <prompt...>
 *   aspect: one of 1:1 2:3 3:4 4:5 5:4 3:2 16:9 9:16
 * Key: GEMINI_API_KEY env var only (never hardcode / commit).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY not set"); process.exit(1); }

const [, , outArg, aspect, ...promptParts] = process.argv;
if (!outArg || !promptParts.length) {
  console.error("usage: gen-image.mjs <outfile.jpg> <aspect> <prompt...>");
  process.exit(1);
}
const prompt = promptParts.join(" ");
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ["IMAGE"],
    imageConfig: { aspectRatio: aspect || "4:5" },
  },
};

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const json = await res.json();
if (json.error) {
  console.error("API ERROR:", json.error.code, json.error.status, "-", json.error.message);
  process.exit(2);
}
const parts = json?.candidates?.[0]?.content?.parts || [];
const imgPart = parts.find((p) => p.inlineData?.data);
if (!imgPart) {
  const textPart = parts.find((p) => p.text);
  console.error("NO IMAGE returned. finishReason:", json?.candidates?.[0]?.finishReason,
    textPart ? "\nmodel text: " + textPart.text.slice(0, 300) : "");
  process.exit(3);
}
const out = resolve(process.cwd(), outArg);
mkdirSync(dirname(out), { recursive: true });
const buf = Buffer.from(imgPart.inlineData.data, "base64");
writeFileSync(out, buf);
console.log(`saved ${outArg} (${(buf.length / 1024).toFixed(0)} KB, ${imgPart.inlineData.mimeType})`);
