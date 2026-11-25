"use client";

import { Payment } from "@/lib/api";

const STATUS_STYLES: Record<Payment["status"], { text: string; label: string }> = {
  success: { text: "text-teal", label: "Paid" },
  pending: { text: "text-gold", label: "Pending" },
  failed: { text: "text-error", label: "Failed" },
  refunded: { text: "text-violet", label: "Refunded" },
};

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-line last:border-0">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="text-sm text-ink font-mono text-right">{value}</span>
    </div>
  );
}

export default function TransactionDetailModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  const s = STATUS_STYLES[payment.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Transaction details"
        className="glass-card w-full rounded-t-[24px] p-5 sm:max-w-sm sm:rounded-[22px] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-display text-[21px] font-bold tracking-tight text-ink">
              {payment.currency || "GHS"} {payment.amount.toFixed(2)}
            </p>
            <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-line text-ink-soft transition-colors hover:bg-white/5 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div>
          <Row label="Reference" value={payment.reference} />
          <Row label="Email" value={payment.email} />
          <Row label="Channel" value={payment.channel || "—"} />
          <Row label="Created" value={formatDateTime(payment.createdAt)} />
          <Row label="Paid at" value={formatDateTime(payment.paidAt)} />
          {payment.status === "refunded" && (
            <Row label="Refunded at" value={formatDateTime(payment.refundedAt)} />
          )}
          <Row label="Gateway response" value={payment.gatewayResponse || "—"} />
        </div>
      </div>
    </div>
  );
}

