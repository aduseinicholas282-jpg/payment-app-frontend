"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyTransactions, Payment } from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import PaymentForm from "@/components/PaymentForm";
import TransactionList from "@/components/TransactionList";
import StatusFilter from "@/components/StatusFilter";

export default function Home() {
  const { user, token, loading, signOut } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState("all");

  const loadTransactions = useCallback(() => {
    if (!token) return;
    getMyTransactions(token, status).then((res) => setPayments(res.payments));
  }, [token, status]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading…</p>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <AuthForm />
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
      <header className="flex items-start justify-between mb-10">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-1 [text-shadow:0_0_12px_var(--teal-glow)]">
            Ledger
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-1">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-teal font-medium hover:underline"
            >
              Admin
            </Link>
          )}
          <button
            onClick={signOut}
            className="text-sm text-ink-soft hover:text-teal transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <PaymentForm onInitiated={loadTransactions} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase">
              No. 003 — History
            </p>
            <StatusFilter value={status} onChange={setStatus} />
          </div>
          <TransactionList payments={payments} />
        </div>
      </div>
    </main>
  );
}
