"use client";

import { useState } from "react";
import { Payment } from "@/lib/api";
import TransactionDetailModal from "./TransactionDetailModal";

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

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="h-2 w-2 rounded-full shrink-0 skeleton" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-2.5 w-16 rounded skeleton" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3 w-16 rounded skeleton ml-auto" />
        <div className="h-2.5 w-12 rounded skeleton ml-auto" />
      </div>
    </div>
  );
}

export default function TransactionList({
  payments,
  loading = false,
}: {
  payments: Payment[];
  loading?: boolean;
}) {
  const [selected, setSelected] = useState<Payment | null>(null);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-surface-line">
        {[0, 1, 2].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="glass-card p-8 text-center sm:p-10">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-line bg-bg-elevated text-teal" aria-hidden="true"><span className="text-xl">↗</span></div>
        <p className="font-display text-[15px] font-semibold text-ink">Your activity will show up here</p>
        <p className="mt-1 text-[13px] text-ink-soft">Your first payment will appear in this list.</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-surface-line">
          {payments.map((p) => {
            const s = STATUS_STYLES[p.status];
            return (
              <button
                key={p._id}
                onClick={() => setSelected(p)}
                className="w-full flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 glow-dot ${s.dot}`}
                    style={{ "--dot-glow": s.glow } as React.CSSProperties}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="max-w-[48vw] truncate text-[13px] font-semibold text-ink sm:max-w-none">
                      {p.reference}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-soft">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[14px] font-semibold tabular-nums text-ink sm:text-[15px]">
                    {p.currency || "GHS"} {p.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {selected && (
        <TransactionDetailModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

