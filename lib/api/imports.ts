/** Cloud photo-import client: Google Photos (picker popup). */

import type { UploadedPhoto } from "@/lib/api/photos";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Runtime config (which options are available) ─────────────────────────────
// Served by the backend so options appear without a frontend rebuild — set
// GOOGLE_PHOTOS_IMPORT_ENABLED in the backend env.
export interface ImportConfig {
  googlePhotos: boolean;
}

export async function getImportConfig(): Promise<ImportConfig> {
  try {
    const res = await fetch(`${API}/web/api/imports/config`, { credentials: "include" });
    if (!res.ok) return { googlePhotos: false };
    return (await res.json()) as ImportConfig;
  } catch {
    return { googlePhotos: false };
  }
}

// ── Google Photos picker (popup + poll) ──────────────────────────────────────
export const googlePhotosStartUrl = () => `${API}/web/api/imports/google/start`;

export interface GooglePollResult {
  status: "idle" | "pending" | "done" | "error";
  photos?: UploadedPhoto[];
}

export async function pollGooglePhotos(): Promise<GooglePollResult> {
  const res = await fetch(`${API}/web/api/imports/google/poll`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return { status: "error" };
  return (await res.json()) as GooglePollResult;
}
