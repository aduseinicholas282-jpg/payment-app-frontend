"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword, ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="glass-card rounded-2xl p-6 max-w-sm w-full text-center space-y-2">
          <p className="text-teal text-sm font-medium">Password updated</p>
          <p className="text-ink-soft text-sm">Taking you back to sign in…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Set a new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              New password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Confirm password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
            {busy ? "Updating…" : "Update password"}
          </button>

          <Link href="/" className="block text-center text-sm text-ink-soft hover:text-teal transition-colors">
            Back to sign in
          </Link>
        </form>
      </div>
    </main>
  );
}