"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmail, type ApiError } from "@/lib/api/auth";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      const t = setTimeout(() => {
        setStatus("error");
        setMessage("No verification token found. Please use the link from your email.");
      }, 0);
      return () => clearTimeout(t);
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/account"), 2000);
      })
      .catch((err: ApiError) => {
        setStatus("error");
        setMessage(err.message ?? "This link is invalid or has expired.");
      });
  }, [token, router]);

  return (
    <div className="text-center">
      {status === "verifying" && (
        <>
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
          <h1 className="font-fraunces text-3xl font-bold text-ink">Verifying your email…</h1>
          <p className="mt-3 text-ink-soft">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-malachite/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="#05D668" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-fraunces text-3xl font-bold text-ink">You&rsquo;re verified.</h1>
          <p className="mt-3 text-ink-soft">Taking you to your account…</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v4m0 4h.01" stroke="#FF7A59" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="#FF7A59" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="font-fraunces text-3xl font-bold text-ink">Link expired</h1>
          <p className="mt-3 text-ink-soft">{message}</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full bg-malachite px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream"
          >
            Back to sign up
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-ink/10 border-t-malachite" />
        <p className="font-fraunces text-3xl font-bold text-ink">Verifying…</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
