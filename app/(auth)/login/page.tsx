"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login, type ApiError } from "@/lib/api/auth";
import { AuthOAuth } from "@/components/auth/auth-oauth";

const GOOGLE_ERRORS: Record<string, string> = {
  google: "We couldn't sign you in with Google. Please try again or use your email below.",
  google_disabled: "Google sign-in isn't available right now — please sign in with your email.",
};

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary; wrap the form in one.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Surface OAuth failures the backend redirected back with (?error=google).
  const oauthError = searchParams.get("error");
  const initialMessage = oauthError ? (GOOGLE_ERRORS[oauthError] ?? "") : "";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    initialMessage ? "error" : "idle",
  );
  const [message, setMessage] = useState(initialMessage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await login({ email: form.email, password: form.password });
      router.push("/account");
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus("error");
      if (apiErr.error === "email_not_verified") {
        setMessage("Please verify your email first. Check your inbox for the link we sent.");
      } else {
        setMessage(apiErr.message ?? "Incorrect email or password.");
      }
    }
  };

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-ink sm:text-4xl">Welcome back</h1>
      <p className="mt-2 text-ink-soft">Sign in to your FusionPrints account.</p>

      <AuthOAuth label="Continue with Google" />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder-ink-mute outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className="block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 pr-12 text-base text-ink placeholder-ink-mute outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-ink-mute transition-colors duration-200 hover:text-ink"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {status === "error" && (
          <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-mute">
        Don&rsquo;t have an account?{" "}
        <Link href="/signup" className="cursor-pointer font-semibold text-ink underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
