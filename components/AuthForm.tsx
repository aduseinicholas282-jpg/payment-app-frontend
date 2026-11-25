"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { login, register, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "signin"
          ? await login(email, password)
          : await register(name, email, password);
      signIn(result.token, result.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="mb-6 text-center sm:mb-7">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal/25 bg-teal/10 text-teal shadow-[0_8px_24px_-16px_var(--teal-glow)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 7.5 12 4l7.5 3.5L12 11 4.5 7.5Z" /><path d="M4.5 12 12 15.5 19.5 12M4.5 16.5 12 20l7.5-3.5" />
          </svg>
        </div>
        <p className="font-display text-[25px] font-extrabold tracking-[-0.055em] text-ink">Ledger</p>
        <h1 className="mt-6 font-display text-[27px] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mx-auto mt-2 max-w-[310px] text-[14px] leading-relaxed text-ink-soft">
          {mode === "signin"
            ? "Sign in to manage payments and keep your records in one place."
            : "A clear, secure place to manage every payment."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-5 p-5 sm:p-7"
      >
        <div className="grid grid-cols-2 rounded-xl border border-surface-line bg-bg/70 p-1" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setError(null); }} className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${mode === "signin" ? "bg-surface-raised text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setError(null); }} className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${mode === "signup" ? "bg-surface-raised text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>Register</button>
        </div>
        {mode === "signup" && (
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-3 text-[15px]"
              placeholder="Nicholas Adusei"
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
            Email
          </label>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-[15px]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
            Password
          </label>
          <input
            required
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-[15px]"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{ "--btn-color": "var(--teal)", "--btn-glow": "var(--teal-glow)" } as React.CSSProperties}
          className="glow-btn min-h-12 w-full rounded-xl py-3 text-[15px] text-bg disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {mode === "signin" && (
          <Link
            href="/forgot-password"
            className="block py-1 text-center text-[13px] font-medium text-ink-soft hover:text-teal transition-colors"
          >
            Forgot password?
          </Link>
        )}
      </form>

      <p className="mt-5 text-center text-[12px] text-ink-soft">Your information is encrypted and protected.</p>
    </div>
  );
}

