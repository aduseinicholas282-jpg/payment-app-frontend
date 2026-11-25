"use client";

import { useState, FormEvent } from "react";
import { initializePayment, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function PaymentForm({ onInitiated }: { onInitiated: () => void }) {
  const { token, user } = useAuth();
  const { showToast } = useToast();
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
      showToast("Redirecting to Paystack…", "info");
      window.location.href = result.authorization_url;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
      showToast(message, "error");
      setBusy(false);
    }
  }

  return (
    <div className="glass-card p-5 sm:p-6" style={{ "--card-glow": "var(--violet-glow)" } as React.CSSProperties}>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-teal">Secure checkout</p>
      <h2 className="font-display mb-5 text-[20px] font-bold tracking-[-0.03em] text-ink sm:text-[22px]">
        Make a payment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
            Email for receipt
          </label>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-[15px]"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-ink-soft">
            Amount (GHS)
          </label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 font-mono text-[15px]"
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
          className="glow-btn min-h-12 w-full rounded-xl py-3 text-[15px] text-white disabled:opacity-60"
        >
          {busy ? "Redirecting to Paystack…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}

