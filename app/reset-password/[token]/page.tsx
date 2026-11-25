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
          <h1 className="font-display text-[27px] font-bold tracking-[-0.04em] text-ink sm:text-[30px]">
            Set a new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-5 p-5 sm:p-7">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
              New password
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-[15px]"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
              Confirm password
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 text-[15px]"
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
