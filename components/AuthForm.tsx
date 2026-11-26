"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { login, register, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LedgerPhoneMockup } from "@/components/LedgerPhoneShowcase";

type AuthMode = "signin" | "signup";

function LedgerLogo() {
  return (
    <span className="auth-flip-logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4.5 7.5 7.5-3.5 7.5 3.5L12 11 4.5 7.5Z" />
        <path d="m4.5 12 7.5 3.5 7.5-3.5M4.5 16.5 12 20l7.5-3.5" />
      </svg>
    </span>
  );
}

function AuthBrand() {
  return (
    <div className="auth-flip-brand">
      <LedgerLogo />
      <span className="auth-flip-brand-copy">
        <strong>Ledger</strong>
        <small>PAYMENTS, MADE CLEAR</small>
      </span>
    </div>
  );
}

function WelcomePanel({ mode, onChangeMode }: { mode: AuthMode; onChangeMode: (mode: AuthMode) => void }) {
  const isSignIn = mode === "signin";

  return (
    <aside className="auth-flip-promo">
      <p className="auth-flip-promo-eyebrow">{isSignIn ? "NEW TO LEDGER?" : "ALREADY WITH LEDGER?"}</p>
      <LedgerPhoneMockup className="auth-flip-phone-stage" showBadges />
      <div className="auth-flip-promo-copy">
        <h2>{isSignIn ? "Your payments, in clear view." : "Welcome back."}</h2>
        <p>
          {isSignIn
            ? "Keep your payment history organized and easy to find, all in one secure place."
            : "Sign in to see your records and continue managing payments with confidence."}
        </p>
        <button type="button" className="auth-flip-switch" onClick={() => onChangeMode(isSignIn ? "signup" : "signin")}>
          {isSignIn ? "Create an account" : "Sign in"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="auth-flip-promo-foot"><span aria-hidden="true">✓</span> Secure access · Simple records</p>
    </aside>
  );
}

export default function AuthForm() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function changeMode(nextMode: AuthMode) {
    if (nextMode === mode) return;
    setError(null);
    setMode(nextMode);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>, submitMode: AuthMode) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = submitMode === "signin"
        ? await login(email, password)
        : await register(name, email, password);
      signIn(result.token, result.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function renderForm(formMode: AuthMode) {
    const isSignIn = formMode === "signin";

    return (
      <form className="auth-flip-form" onSubmit={(event) => handleSubmit(event, formMode)} aria-busy={busy}>
        <AuthBrand />
        <div className="auth-flip-intro">
          <p className="auth-flip-kicker">YOUR FINANCIAL SPACE</p>
          <h1 className="auth-flip-title">{isSignIn ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-flip-description">
            {isSignIn
              ? "Sign in to manage payments and keep your records together."
              : "Set up your secure Ledger account in just a few steps."}
          </p>
        </div>

        <div className="auth-flip-fields">
          {!isSignIn && (
            <div className="auth-flip-field">
              <label className="auth-label" htmlFor="signup-name">Full name</label>
              <input
                required
                id="signup-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="auth-input"
                placeholder="Your full name"
              />
            </div>
          )}
          <div className="auth-flip-field">
            <label className="auth-label" htmlFor={`${formMode}-email`}>Email</label>
            <input
              required
              id={`${formMode}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>
          <div className="auth-flip-field">
            <label className="auth-label" htmlFor={`${formMode}-password`}>Password</label>
            <input
              required
              id={`${formMode}-password`}
              type="password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
              placeholder={isSignIn ? "Enter your password" : "At least 8 characters"}
            />
          </div>
        </div>

        {error && <p className="auth-flip-error" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          style={{ "--btn-color": "var(--teal)", "--btn-glow": "var(--teal-glow)" } as React.CSSProperties}
          className="glow-btn auth-flip-submit disabled:opacity-60"
        >
          {busy ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
          {!busy && <span aria-hidden="true">→</span>}
        </button>

        {isSignIn && (
          <Link href="/forgot-password" className="auth-flip-forgot">Forgot password?</Link>
        )}

        <p className="auth-flip-mobile-switch">
          {isSignIn ? "New to Ledger?" : "Already have an account?"}
          <button type="button" onClick={() => changeMode(isSignIn ? "signup" : "signin")}>
            {isSignIn ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    );
  }

  return (
    <div className="auth-shell auth-shell--animated">
      <div className="auth-flip-scene">
        <div className="auth-flip-card" data-mode={mode}>
          <section
            className="auth-flip-face auth-flip-face--signin"
            aria-hidden={mode !== "signin"}
            inert={mode !== "signin"}
          >
            {renderForm("signin")}
            <WelcomePanel mode="signin" onChangeMode={changeMode} />
          </section>
          <section
            className="auth-flip-face auth-flip-face--signup"
            aria-hidden={mode !== "signup"}
            inert={mode !== "signup"}
          >
            {renderForm("signup")}
            <WelcomePanel mode="signup" onChangeMode={changeMode} />
          </section>
        </div>
      </div>
      <p className="auth-flip-security"><span aria-hidden="true">✓</span> Your information is encrypted and protected.</p>
    </div>
  );
}

