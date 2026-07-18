"use client";

import { Payment } from "@/lib/api";

const STATUS_STYLES: Record<Payment["status"], { dot: string; label: string; text: string }> = {
  success: { dot: "bg-success", label: "Paid", text: "text-success" },
  pending: { dot: "bg-gold", label: "Pending", text: "text-gold" },
  failed: { dot: "bg-error", label: "Failed", text: "text-error" },
  refunded: { dot: "bg-ink-soft", label: "Refunded", text: "text-ink-soft" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="bg-white border border-paper-line rounded-lg p-8 text-center">
        <p className="text-ink-soft text-sm">
          No entries yet. Your first payment will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-paper-line rounded-lg overflow-hidden shadow-sm">
      <div className="ledger-bg divide-y divide-paper-line">
        {payments.map((p) => {
          const s = STATUS_STYLES[p.status];
          return (
            <div
              key={p._id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} aria-hidden />
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase text-ink-soft truncate">
                    {p.reference}
                  </p>
                  <p className="text-xs text-ink-soft">{formatDate(p.createdAt)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm font-medium text-ink">
                  {p.currency || "GHS"} {p.amount.toFixed(2)}
                </p>
                <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}