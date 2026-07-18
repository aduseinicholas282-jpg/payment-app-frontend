"use client";

import { Payment } from "@/lib/api";

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

export default function TransactionList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-ink-soft text-sm">
          No entries yet. Your first payment will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="divide-y divide-surface-line">
        {payments.map((p) => {
          const s = STATUS_STYLES[p.status];
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
                  <p className="font-mono text-xs uppercase text-ink-soft truncate">
                    {p.reference}
                  </p>
                  <p className="text-xs text-ink-soft/70">{formatDate(p.createdAt)}</p>
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
