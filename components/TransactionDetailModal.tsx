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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              {payment.currency || "GHS"} {payment.amount.toFixed(2)}
            </p>
            <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink transition-colors text-lg leading-none"
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
