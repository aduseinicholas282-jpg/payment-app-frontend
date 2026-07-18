"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyTransactions, getMyStats, Payment, Stats } from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import PaymentForm from "@/components/PaymentForm";
import TransactionList from "@/components/TransactionList";
import StatusFilter from "@/components/StatusFilter";
import StatsGrid from "@/components/StatsGrid";

export default function Home() {
  const { user, token, loading, signOut } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [txLoading, setTxLoading] = useState(true);

  const loadTransactions = useCallback(() => {
    if (!token) return;
    setTxLoading(true);
    getMyTransactions(token, status, page)
      .then((res) => {
        setPayments(res.payments);
        setPages(res.pages);
      })
      .finally(() => setTxLoading(false));
  }, [token, status, page]);

  const loadStats = useCallback(() => {
    if (!token) return;
    setStatsLoading(true);
    getMyStats(token)
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
      <header className="flex flex-wrap items-start justify-between gap-y-3 mb-10">
        <div>
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
        <StatsGrid stats={stats} loading={statsLoading} />

        <PaymentForm
          onInitiated={() => {
            loadTransactions();
            loadStats();
          }}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-ink-soft text-sm font-medium">History</p>
            <StatusFilter
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />
          </div>
          <TransactionList payments={payments} loading={txLoading} />

          {!txLoading && pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs text-ink-soft hover:text-teal disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs text-ink-soft">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs text-ink-soft hover:text-teal disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}