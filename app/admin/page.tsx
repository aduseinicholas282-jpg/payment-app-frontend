"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAdminTransactions, getAdminStats, Payment, Stats } from "@/lib/api";
import AdminTransactionTable from "@/components/AdminTransactionTable";
import StatusFilter from "@/components/StatusFilter";
import StatsGrid from "@/components/StatsGrid";

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [txLoading, setTxLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setTxLoading(true);
    getAdminTransactions(token, { status, email, page })
      .then((res) => {
        setPayments(res.payments);
        setPages(res.pages);
        setTotal(res.total);
      })
      .finally(() => setTxLoading(false));
  }, [token, status, email, page]);

  const loadStats = useCallback(() => {
    if (!token) return;
    setStatsLoading(true);
    getAdminStats(token)
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

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

  if (!user || user.role !== "admin") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-3">
        <p className="text-ink-soft text-sm">
          {user ? "You don't have access to this page." : "Please sign in first."}
        </p>
        <Link href="/" className="text-teal text-sm font-medium hover:underline">
          Back to ledger
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
      <header className="flex flex-wrap items-start justify-between gap-y-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            All transactions
          </h1>
          <p className="text-ink-soft text-sm mt-1">{total} total entries</p>
        </div>
        <Link href="/" className="text-sm text-ink-soft hover:text-teal transition-colors mt-1">
          Back to ledger
        </Link>
      </header>

      <div className="mb-6">
        <StatsGrid stats={stats} loading={statsLoading} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by email…"
          className="rounded-lg bg-bg-elevated border border-surface-line px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet"
        />
      </div>

      <AdminTransactionTable
        payments={payments}
        onRefunded={() => {
          load();
          loadStats();
        }}
        loading={txLoading}
      />

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
    </main>
  );
}