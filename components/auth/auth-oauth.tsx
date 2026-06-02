"use client";

import { useState } from "react";

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
 * Visual-only until OAuth is wired (roadmap 2.1.7); clicking shows a note.
 */
export function AuthOAuth({ label }: { label: string }) {
  const [note, setNote] = useState(false);

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setNote(true)}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-ink/15 bg-white text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
      >
        <GoogleIcon />
        {label}
      </button>
      {note && (
        <p className="mt-2 text-center text-xs text-ink-mute">
          Google sign-in is coming soon — continue with your email below for now.
        </p>
      )}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">or</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
    </div>
  );
}
