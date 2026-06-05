/** Cloud photo-import client: Google Photos (picker popup) + Dropbox (Chooser). */

import type { UploadedPhoto } from "@/lib/api/photos";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Runtime config (which options are available) ─────────────────────────────
// Served by the backend so options appear without a frontend rebuild — set
// GOOGLE_PHOTOS_IMPORT_ENABLED / DROPBOX_APP_KEY in the backend env.
export interface ImportConfig {
  googlePhotos: boolean;
  dropboxAppKey: string | null;
}

export async function getImportConfig(): Promise<ImportConfig> {
  try {
    const res = await fetch(`${API}/web/api/imports/config`, { credentials: "include" });
    if (!res.ok) return { googlePhotos: false, dropboxAppKey: null };
    return (await res.json()) as ImportConfig;
  } catch {
    return { googlePhotos: false, dropboxAppKey: null };
  }
}

// ── Shared: import from URLs (Dropbox direct links) ──────────────────────────
export async function importFromUrls(
  files: { url: string; filename?: string }[],
): Promise<UploadedPhoto[]> {
  const res = await fetch(`${API}/web/api/imports/from-urls`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return (data.photos ?? []) as UploadedPhoto[];
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

// ── Dropbox Chooser (drop-in) ────────────────────────────────────────────────
interface DropboxFile {
  link: string;
  name: string;
}
interface DropboxChooseOptions {
  success: (files: DropboxFile[]) => void;
  cancel?: () => void;
  linkType?: "direct" | "preview";
  multiselect?: boolean;
  extensions?: string[];
}
interface DropboxGlobal {
  choose: (options: DropboxChooseOptions) => void;
}
declare global {
  interface Window {
    Dropbox?: DropboxGlobal;
  }
}

let dropboxLoad: Promise<void> | null = null;
function loadDropbox(appKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Dropbox) return Promise.resolve();
  if (dropboxLoad) return dropboxLoad;
  dropboxLoad = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.dropbox.com/static/api/2/dropins.js";
    s.id = "dropboxjs";
    s.setAttribute("data-app-key", appKey);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("dropbox load failed"));
    document.body.appendChild(s);
  });
  return dropboxLoad;
}

/** Open the Dropbox Chooser; resolves to the selected files' direct links. */
export async function chooseFromDropbox(appKey: string): Promise<{ url: string; filename: string }[]> {
  await loadDropbox(appKey);
  return new Promise((resolve) => {
    if (!window.Dropbox) return resolve([]);
    window.Dropbox.choose({
      linkType: "direct",
      multiselect: true,
      extensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tiff"],
      success: (files) => resolve(files.map((f) => ({ url: f.link, filename: f.name }))),
      cancel: () => resolve([]),
    });
  });
}
