/** Cloud photo-import client: Google Photos (picker popup) + Dropbox (Chooser). */

import type { UploadedPhoto } from "@/lib/api/photos";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export const DROPBOX_APP_KEY = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY ?? "";

/**
 * Google Photos is gated off by default: the option only appears once the Google
 * Cloud setup (Picker API + scope on the consent screen) is done, otherwise the
 * popup would error at Google. Set NEXT_PUBLIC_GOOGLE_PHOTOS_ENABLED=1 to show it.
 */
export const googlePhotosEnabled = () =>
  (process.env.NEXT_PUBLIC_GOOGLE_PHOTOS_ENABLED ?? "") === "1";

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

export const dropboxEnabled = () => Boolean(DROPBOX_APP_KEY);

let dropboxLoad: Promise<void> | null = null;
function loadDropbox(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Dropbox) return Promise.resolve();
  if (dropboxLoad) return dropboxLoad;
  dropboxLoad = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.dropbox.com/static/api/2/dropins.js";
    s.id = "dropboxjs";
    s.setAttribute("data-app-key", DROPBOX_APP_KEY);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("dropbox load failed"));
    document.body.appendChild(s);
  });
  return dropboxLoad;
}

/** Open the Dropbox Chooser; resolves to the selected files' direct links. */
export async function chooseFromDropbox(): Promise<{ url: string; filename: string }[]> {
  await loadDropbox();
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
