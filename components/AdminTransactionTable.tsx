"use client";

import { useState } from "react";
import { Payment, refundPayment, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<Payment["status"], { dot: string; text: string; label: string }> = {
  success: { dot: "bg-success", text: "text-success", label: "Paid" },
  pending: { dot: "bg-gold", text: "text-gold", label: "Pending" },
  failed: { dot: "bg-error", text: "text-error", label: "Failed" },
  refunded: { dot: "bg-ink-soft", text: "text-ink-soft", label: "Refunded" },
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
      <div className="bg-white border border-paper-line rounded-lg p-8 text-center">
        <p className="text-ink-soft text-sm">No transactions match this filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-paper-line rounded-lg overflow-hidden shadow-sm">
      {error && (
        <p className="text-sm text-error bg-error-soft px-5 py-2">{error}</p>
      )}
      <div className="divide-y divide-paper-line">
        {payments.map((p) => {
          const s = STATUS_STYLES[p.status];
          const owner =
            p.user && typeof p.user === "object" ? p.user.name : p.email;
          return (
            <div
              key={p._id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{owner}</p>
                  <p className="font-mono text-xs uppercase text-ink-soft truncate">
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
                    className="text-xs font-medium text-error border border-error/30 rounded px-2.5 py-1.5 hover:bg-error-soft transition-colors disabled:opacity-50 whitespace-nowrap"
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