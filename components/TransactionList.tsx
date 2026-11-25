"use client";

import { useState } from "react";
import { Payment } from "@/lib/api";
import TransactionDetailModal from "./TransactionDetailModal";

const STATUS_STYLES: Record<
  Payment["status"],
  { text: string; label: string; symbol: string }
> = {
  success: { text: "transaction-status--success", label: "Paid", symbol: "✓" },
  pending: { text: "transaction-status--pending", label: "Pending", symbol: "…" },
  failed: { text: "transaction-status--failed", label: "Failed", symbol: "!" },
  refunded: { text: "transaction-status--refunded", label: "Refunded", symbol: "↩" },
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
    <div className="transaction-row transaction-row--loading">
      <span className="transaction-icon transaction-skeleton-icon" />
      <div className="transaction-description">
        <div className="metric-skeleton metric-skeleton--label" />
        <div className="metric-skeleton metric-skeleton--note" />
      </div>
      <div className="transaction-value">
        <div className="metric-skeleton metric-skeleton--value" />
        <div className="metric-skeleton metric-skeleton--note" />
      </div>
    </div>
  );
}

export default function TransactionList({
  payments,
  loading = false,
  emptyMessage,
}: {
  payments: Payment[];
  loading?: boolean;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<Payment | null>(null);

  if (loading) {
    return (
      <div className="transaction-list transaction-list--loading" aria-label="Loading recent activity" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="transaction-empty">
        <span className="transaction-empty-icon" aria-hidden="true">↗</span>
        <p>{emptyMessage || "No payments to show yet."}</p>
        <small>{emptyMessage ? "Try another search or filter." : "Your payment activity will appear here."}</small>
      </div>
    );
  }

  return (
    <>
      <div className="transaction-list">
        {payments.map((payment) => {
          const status = STATUS_STYLES[payment.status];
          const amount = new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payment.amount);

          return (
            <button key={payment._id} type="button" onClick={() => setSelected(payment)} className="transaction-row">
              <span className={`transaction-icon ${status.text}`} aria-hidden="true">{status.symbol}</span>
              <span className="transaction-description">
                <strong>{payment.status === "success" ? "Payment successful" : `${status.label} payment`}</strong>
                <small>{formatDate(payment.createdAt)} <span aria-hidden="true">·</span> {payment.reference}</small>
              </span>
              <span className="transaction-value">
                <strong>{payment.currency || "GHS"} {amount}</strong>
                <small className={status.text}>{status.label}</small>
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <TransactionDetailModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

