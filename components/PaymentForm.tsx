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
    <div className="bg-white border border-paper-line rounded-lg p-6 shadow-sm">
      <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-1">
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
            className="w-full rounded border border-paper-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
            className="w-full rounded border border-paper-line px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal"
            placeholder="0.00"
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
          className="w-full bg-gold text-white rounded py-2.5 text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-60"
        >
          {busy ? "Redirecting to Paystack…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}