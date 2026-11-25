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
    <div className="payment-widget">
      <div className="payment-widget-header">
        <span className="payment-widget-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18m-13 5h3" /></svg>
        </span>
        <div>
          <h2 className="payment-widget-title">Make a payment</h2>
          <p className="payment-widget-description">Enter your details to continue with Paystack.</p>
        </div>
        <span className="payment-secure-label">Secure checkout</span>
      </div>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-field">
          <label className="payment-label" htmlFor="payment-email">
            Email for receipt
          </label>
          <input
            id="payment-email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="payment-input w-full px-4 py-3 text-[15px]"
          />
        </div>
        <div className="payment-field">
          <label className="payment-label" htmlFor="payment-amount">
            Amount (GHS)
          </label>
          <input
            id="payment-amount"
            required
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="payment-input w-full px-4 py-3 font-mono text-[15px]"
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
          style={{ "--btn-color": "var(--teal)", "--btn-glow": "var(--teal-glow)" } as React.CSSProperties}
          className="glow-btn payment-submit min-h-12 w-full rounded-xl py-3 text-[15px] text-bg disabled:opacity-60"
        >
          {busy ? "Redirecting to Paystack…" : "Pay now"}
        </button>
      </form>
    </div>
  );
}

