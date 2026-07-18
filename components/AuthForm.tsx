"use client";

import { useState, FormEvent } from "react";
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
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-2">
          No. 001 — Account
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {mode === "signin" ? "Open your ledger" : "Start a new ledger"}
        </h1>
        <p className="text-ink-soft mt-2 text-sm">
          {mode === "signin"
            ? "Sign in to see your payment history."
            : "One account, every payment recorded."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-paper-line rounded-lg p-6 space-y-4 shadow-sm"
      >
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-paper-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="Nicholas Adusei"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-paper-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Password
          </label>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-paper-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error-soft rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-teal text-white rounded py-2.5 text-sm font-medium hover:bg-teal/90 transition-colors disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
        }}
        className="mt-4 w-full text-center text-sm text-ink-soft hover:text-teal transition-colors"
      >
        {mode === "signin"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}