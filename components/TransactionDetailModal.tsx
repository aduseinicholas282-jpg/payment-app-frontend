"use client";

import { useToast } from "@/context/ToastContext";
import { Payment } from "@/lib/api";

const STATUS_STYLES: Record<Payment["status"], { label: string; icon: string }> = {
  success: { label: "Paid", icon: "✓" },
  pending: { label: "Pending", icon: "…" },
  failed: { label: "Failed", icon: "!" },
  refunded: { label: "Refunded", icon: "↺" },
};

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(payment: Payment) {
  return `${payment.currency || "GHS"} ${new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(payment.amount)}`;
}

function receiptText(payment: Payment, status: string) {
  return [
    "Ledger payment receipt",
    `Status: ${status}`,
    `Amount: ${formatAmount(payment)}`,
    `Reference: ${payment.reference}`,
    `Email: ${payment.email}`,
    `Channel: ${payment.channel || "—"}`,
    `Created: ${formatDateTime(payment.createdAt)}`,
    `Paid: ${formatDateTime(payment.paidAt)}`,
  ].join("\n");
}

export default function TransactionDetailModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const status = STATUS_STYLES[payment.status];
  const amount = formatAmount(payment);
  const text = receiptText(payment, status.label);

  async function copyReceiptDetails() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Unable to copy receipt");
    }
    showToast("Receipt details copied. Paste them into a message to share.", "success");
  }

  async function shareReceipt() {
    const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

    // Windows desktop browsers may expose navigator.share even when their
    // system share panel cannot load. Use copy there so the action always works.
    if (isPhone && navigator.share) {
      try {
        await navigator.share({ title: "Ledger payment receipt", text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await copyReceiptDetails();
    } catch {
      showToast("Could not copy the receipt. You can still save it as a PDF.", "error");
    }
  }

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ledger payment receipt"
        className="receipt-card receipt-print-root"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="receipt-close" onClick={onClose} aria-label="Close receipt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <header className="receipt-brand">
          <span className="receipt-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4.5 7.5 7.5-3.5 7.5 3.5L12 11 4.5 7.5Z" />
              <path d="m4.5 12 7.5 3.5 7.5-3.5M4.5 16.5 12 20l7.5-3.5" />
            </svg>
          </span>
          <span className="receipt-brand-copy">
            <strong>Ledger</strong>
            <small>PAYMENT RECEIPT</small>
          </span>
        </header>

        <div className="receipt-summary">
          <span className={`receipt-status receipt-status--${payment.status}`}>
            <span aria-hidden="true">{status.icon}</span>{status.label}
          </span>
          <p className="receipt-amount">{amount}</p>
          <p className="receipt-summary-caption">
            {payment.status === "success" ? "Payment completed" : "Payment details"}
          </p>
        </div>

        <div className="receipt-divider" aria-hidden="true"><span /></div>

        <dl className="receipt-details">
          <div><dt>Reference</dt><dd>{payment.reference}</dd></div>
          <div><dt>Email</dt><dd>{payment.email}</dd></div>
          <div><dt>Payment method</dt><dd>{payment.channel || "—"}</dd></div>
          <div><dt>Created</dt><dd>{formatDateTime(payment.createdAt)}</dd></div>
          <div><dt>Paid at</dt><dd>{formatDateTime(payment.paidAt)}</dd></div>
          {payment.status === "refunded" && <div><dt>Refunded at</dt><dd>{formatDateTime(payment.refundedAt)}</dd></div>}
          {payment.gatewayResponse && <div><dt>Gateway response</dt><dd>{payment.gatewayResponse}</dd></div>}
        </dl>

        <p className="receipt-footnote">
          <span aria-hidden="true">✓</span>
          Generated from your Ledger payment history.
        </p>

        <div className="receipt-actions">
          <button type="button" className="receipt-action receipt-action--primary" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
              <path d="M7 14h10v7H7z" />
            </svg>
            Save receipt
          </button>
          <button type="button" className="receipt-action receipt-action--secondary" onClick={shareReceipt}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.2" />
            </svg>
            Share receipt
          </button>
        </div>
      </section>
    </div>
  );
}
