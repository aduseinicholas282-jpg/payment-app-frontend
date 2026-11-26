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
    <div className="auth-shell">
      <div className="auth-heading">
        <div className="auth-brand">
        <div className="auth-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 7.5 12 4l7.5 3.5L12 11 4.5 7.5Z" /><path d="M4.5 12 12 15.5 19.5 12M4.5 16.5 12 20l7.5-3.5" />
          </svg>
        </div>
        <p className="auth-brand-name">Ledger</p>
        </div>
        <h1 className="auth-title">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="auth-description">
          {mode === "signin"
            ? "Sign in to manage payments and keep your records in one place."
            : "A clear, secure place to manage every payment."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        data-mode={mode}
        className="auth-card"
      >
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setError(null); }} className={`auth-tab ${mode === "signin" ? "auth-tab--active" : ""}`}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setError(null); }} className={`auth-tab ${mode === "signup" ? "auth-tab--active" : ""}`}>Register</button>
        </div>
        {mode === "signup" && (
          <div className="auth-field auth-field--name">
            <label className="auth-label">
              Full name
            </label>
            <input
              required
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="auth-input"
              placeholder="Nicholas Adusei"
            />
          </div>
        )}
        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-email">
            Email
          </label>
          <input
            required
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-password">
            Password
          </label>
          <input
            required
            id="auth-password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
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
          className="glow-btn auth-submit disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {mode === "signin" && (
          <Link
            href="/forgot-password"
            className="auth-forgot"
          >
            Forgot password?
          </Link>
        )}
      </form>

      <p className="auth-security"><span aria-hidden="true">✓</span> Your information is encrypted and protected.</p>
    </div>
  );
}
