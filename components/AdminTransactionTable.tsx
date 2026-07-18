"use client";

import { useState } from "react";
import { Payment, refundPayment, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<
  Payment["status"],
  { dot: string; text: string; glow: string; label: string }
> = {
  success: { dot: "bg-teal", text: "text-teal", glow: "var(--teal-glow)", label: "Paid" },
  pending: { dot: "bg-gold", text: "text-gold", glow: "var(--gold-glow)", label: "Pending" },
  failed: { dot: "bg-error", text: "text-error", glow: "var(--error-glow)", label: "Failed" },
  refunded: { dot: "bg-violet", text: "text-violet", glow: "var(--violet-glow)", label: "Refunded" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminTransactionTable({
  payments,
  onRefunded,
}: {
  payments: Payment[];
  onRefunded: () => void;
}) {
  const { token } = useAuth();
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund(reference: string) {
    if (!token) return;
    setError(null);
    setBusyRef(reference);
    try {
      await refundPayment(token, reference);
      onRefunded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refund failed");
    } finally {
      setBusyRef(null);
    }
  }

  if (payments.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-ink-soft text-sm">No transactions match this filter.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {error && (
        <p className="text-sm text-error bg-error/10 border-b border-error/20 px-5 py-2">
          {error}
        </p>
      )}
      <div className="divide-y divide-surface-line">
        {payments.map((p) => {
          const s = STATUS_STYLES[p.status];
          const owner =
            p.user && typeof p.user === "object" ? p.user.name : p.email;
          return (
            <div
              key={p._id}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 glow-dot ${s.dot}`}
                  style={{ "--dot-glow": s.glow } as React.CSSProperties}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{owner}</p>
                  <p className="font-mono text-xs uppercase text-ink-soft/70 truncate">
                    {p.reference} · {formatDate(p.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-ink">
                    {p.currency || "GHS"} {p.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
                </div>
                {p.status === "success" && (
                  <button
                    onClick={() => handleRefund(p.reference)}
                    disabled={busyRef === p.reference}
                    className="text-xs font-medium text-error border border-error/30 rounded-lg px-2.5 py-1.5 hover:bg-error/10 hover:shadow-[0_0_16px_-4px_var(--error-glow)] transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {busyRef === p.reference ? "Refunding…" : "Refund"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
