"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { forgotPassword, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setDevUrl(res.devResetUrl || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Reset your password
          </h1>
          <p className="text-ink-soft mt-2 text-sm">
            We&apos;ll send you a link to set a new one.
          </p>
        </div>

        {message ? (
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <p className="text-sm text-ink">{message}</p>
            {devUrl && (
              <div className="text-xs text-ink-soft border border-surface-line rounded-lg p-3 space-y-2">
                <p>
                  Email isn&apos;t configured in this environment yet, so here&apos;s
                  the link directly:
                </p>
                <Link href={devUrl} className="text-teal break-all hover:underline">
                  {devUrl}
                </Link>
              </div>
            )}
            <Link href="/" className="block text-center text-sm text-teal hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                placeholder="you@example.com"
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
              className="glow-btn w-full text-bg rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>

            <Link href="/" className="block text-center text-sm text-ink-soft hover:text-teal transition-colors">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}