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
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <AuthForm />
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-7 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal">Your account</p>
          <h1 className="font-display text-[25px] font-bold tracking-[-0.04em] text-ink sm:text-[29px]">
            Welcome, {user.name.split(" ")[0]}
          </h1>
        </div>
        <nav aria-label="Account navigation" className="flex items-center gap-3 rounded-xl border border-surface-line bg-surface/75 p-1.5 sm:gap-4">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg px-2 py-1.5 text-[13px] font-semibold text-teal hover:bg-white/5"
            >
              Admin
            </Link>
          )}
          <Link
            href="/settings"
            className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Settings
          </Link>
          <button
            onClick={signOut}
            className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </nav>
      </header>

      <div className="space-y-6 sm:space-y-8">
        <StatsGrid stats={stats} loading={statsLoading} />

        <PaymentForm
          onInitiated={() => {
            loadTransactions();
            loadStats();
          }}
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-[17px] font-bold tracking-tight text-ink">Recent activity</h2><p className="text-[13px] text-ink-soft">Your latest payment records</p></div>
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

