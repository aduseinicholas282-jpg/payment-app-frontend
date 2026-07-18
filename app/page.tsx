"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyTransactions, Payment } from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import PaymentForm from "@/components/PaymentForm";
import TransactionList from "@/components/TransactionList";

export default function Home() {
  const { user, token, loading, signOut } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadTransactions = useCallback(() => {
    if (!token) return;
    getMyTransactions(token).then((res) => setPayments(res.payments));
  }, [token]);

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
          <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-1">
            Ledger
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome, {user.name.split(" ")[0]}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-ink-soft hover:text-teal transition-colors mt-1"
        >
          Sign out
        </button>
      </header>

      <div className="space-y-8">
        <PaymentForm onInitiated={loadTransactions} />

        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-teal uppercase mb-3">
            No. 003 — History
          </p>
          <TransactionList payments={payments} />
        </div>
      </div>
    </main>
  );
}