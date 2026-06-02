"use client";

import { useState } from "react";
import Link from "next/link";
import { signup, type ApiError } from "@/lib/api/auth";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "", whatsappNumber: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    try {
      const res = await signup({
        email: form.email,
        password: form.password,
        whatsappNumber: form.whatsappNumber || undefined,
      });
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus("error");
      if (apiErr.issues) {
        setFieldErrors(apiErr.issues);
        setMessage("Please fix the errors below.");
      } else {
        setMessage(apiErr.message ?? "Something went wrong. Please try again.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-malachite/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#05D668" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-fraunces text-3xl font-bold text-ink">Check your inbox</h1>
        <p className="mt-3 text-ink-soft">
          We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
        </p>
        <p className="mt-6 text-sm text-ink-mute">
          Already have an account?{" "}
          <Link href="/login" className="cursor-pointer font-semibold text-ink underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-ink">Create your account</h1>
      <p className="mt-2 text-ink-soft">Print your memories. Start here.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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
          {fieldErrors.email?.map((e) => (
            <p key={e} className="mt-1 text-sm text-coral">{e}</p>
          ))}
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
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
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
          {fieldErrors.password?.map((e) => (
            <p key={e} className="mt-1 text-sm text-coral">{e}</p>
          ))}
        </div>

        {/* WhatsApp (optional) */}
        <div>
          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-ink">
            WhatsApp number <span className="font-normal text-ink-mute">(optional)</span>
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            autoComplete="tel"
            value={form.whatsappNumber}
            onChange={handleChange}
            placeholder="+263771234567"
            className="mt-1.5 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder-ink-mute outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
          />
          <p className="mt-1 text-xs text-ink-mute">Links your web account to existing WhatsApp orders.</p>
          {fieldErrors.whatsappNumber?.map((e) => (
            <p key={e} className="mt-1 text-sm text-coral">{e}</p>
          ))}
        </div>

        {/* Error banner */}
        {status === "error" && !Object.keys(fieldErrors).length && (
          <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-malachite text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-mute">
        Already have an account?{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-ink underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
