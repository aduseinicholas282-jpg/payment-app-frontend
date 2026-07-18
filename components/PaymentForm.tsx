"use client";

import { useState, FormEvent } from "react";
import { initializePayment, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function PaymentForm({ onInitiated }: { onInitiated: () => void }) {
  const { token, user } = useAuth();
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setBusy(true);
    try {
      const result = await initializePayment(token, email, Number(amount));
      onInitiated();
      window.location.href = result.authorization_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <p className="font-mono text-xs tracking-[0.2em] text-violet uppercase mb-1 [text-shadow:0_0_12px_var(--violet-glow)]">
        No. 002 — New entry
      </p>
      <h2 className="font-display text-xl font-semibold text-ink mb-4">
        Make a payment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Email for receipt
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Amount (GHS)
          </label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
            placeholder="0.00"
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
          style={{ "--btn-color": "var(--violet)", "--btn-glow": "var(--violet-glow)" } as React.CSSProperties}
          className="glow-btn w-full text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? "Redirecting to Paystack…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}