"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const START_URL = `${API}/web/api/auth/google`;

const POPUP_ERRORS: Record<string, string> = {
  google: "We couldn't sign you in with Google. Please try again.",
  google_disabled: "Google sign-in isn't available right now. Use your email below.",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

/**
 * Google sign-in/up button + "or" divider, shared by login and signup.
 *
 * Opens Google in a small popup; the backend callback postMessages the result
 * back, then we route to /account and the popup auto-closes. Falls back to a
 * full-page redirect if the popup is blocked (or JS is off — the anchor href).
 */
export function AuthOAuth({ label }: { label: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const openPopup = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setError("");

    const w = 500;
    const h = 640;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    const popup = window.open(
      `${START_URL}?popup=1`,
      "fp-google-auth",
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );

    // Popup blocked → fall back to a full-page redirect.
    if (!popup) {
      window.location.href = START_URL;
      return;
    }
    popupRef.current = popup;
    setPending(true);
  }, []);

  // Listen for the result the backend popup posts back.
  useEffect(() => {
    let apiOrigin = "";
    try {
      apiOrigin = new URL(API).origin;
    } catch {
      apiOrigin = "";
    }

    const onMessage = (event: MessageEvent) => {
      if (apiOrigin && event.origin !== apiOrigin) return;
      const data = event.data as { source?: string; ok?: boolean; error?: string } | null;
      if (!data || data.source !== "fp-google-auth") return;

      setPending(false);
      popupRef.current?.close();
      popupRef.current = null;

      if (data.ok) {
        router.push("/account");
        router.refresh();
      } else {
        setError(POPUP_ERRORS[data.error ?? "google"] ?? POPUP_ERRORS.google);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  // If the user closes the popup themselves, drop the pending state.
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        popupRef.current = null;
        setPending(false);
        window.clearInterval(timer);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [pending]);

  return (
    <div className="mt-8">
      <a
        href={START_URL}
        onClick={openPopup}
        aria-busy={pending}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-ink/15 bg-white text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
      >
        <GoogleIcon />
        {pending ? "Waiting for Google…" : label}
      </a>
      {error && <p className="mt-2 text-center text-xs text-coral">{error}</p>}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">or</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
    </div>
  );
}
