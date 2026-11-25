"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyTransactions, getMyStats, Payment, Stats } from "@/lib/api";
import AuthForm from "@/components/AuthForm";
import PaymentForm from "@/components/PaymentForm";
import TransactionList from "@/components/TransactionList";
import StatusFilter from "@/components/StatusFilter";
import StatsGrid from "@/components/StatsGrid";

function LedgerMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`ledger-mark${small ? " ledger-mark--small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4.5 7.5 7.5-3.5 7.5 3.5L12 11 4.5 7.5Z" />
        <path d="m4.5 12 7.5 3.5 7.5-3.5M4.5 16.5 12 20l7.5-3.5" />
      </svg>
    </span>
  );
}

function Initials({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return <span className="profile-avatar" aria-hidden="true">{initials || "L"}</span>;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const { user, token, loading, signOut } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
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

  useEffect(() => loadTransactions(), [loadTransactions]);
  useEffect(() => loadStats(), [loadStats]);

  const filteredPayments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return payments;

    return payments.filter((payment) => {
      const searchable = [
        payment.reference,
        payment.email,
        payment.status,
        payment.currency,
        payment.amount.toFixed(2),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(needle);
    });
  }, [payments, search]);

  if (loading) {
    return (
      <main className="dashboard-loading" aria-live="polite">
        <LedgerMark />
        <p>Loading your Ledger…</p>
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

  const firstName = user.name.trim().split(/\s+/)[0] || "there";
  const totalPaid = stats?.totalPaid ?? 0;
  const transactionCount = stats?.totalTransactions ?? 0;

  return (
    <main className="dashboard-page" id="home">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <Link href="/" className="dashboard-brand" aria-label="Ledger home">
            <LedgerMark />
            <span className="dashboard-brand-copy">
              <span>Ledger</span>
              <small>Payments, made clear</small>
            </span>
          </Link>

          <nav className="dashboard-topnav" aria-label="Main navigation">
            <a className="dashboard-nav-link dashboard-nav-link--active" href="#home">Home</a>
            <a className="dashboard-nav-link" href="#overview">Overview</a>
            <a className="dashboard-nav-link" href="#activity">Activity</a>
          </nav>

          <div className="dashboard-user">
            {user.role === "admin" && <Link className="dashboard-admin-link" href="/admin">Admin</Link>}
            <Link href="/settings" className="dashboard-user-link" aria-label={`Account settings for ${user.name}`}>
              <Initials name={user.name} />
              <span className="dashboard-user-copy">
                <strong>{firstName}</strong>
                <small>Personal account</small>
              </span>
            </Link>
            <button type="button" onClick={signOut} className="dashboard-signout">Sign out</button>
          </div>
        </header>

        <section className="dashboard-welcome" aria-labelledby="welcome-heading">
          <div>
            <p className="dashboard-eyebrow">YOUR FINANCIAL OVERVIEW</p>
            <h1 id="welcome-heading">Welcome back, {firstName}</h1>
            <p className="dashboard-welcome-copy">Your payments and account activity, all in one place.</p>
          </div>
          <label className="dashboard-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payments"
              aria-label="Search payments on this page"
            />
            <span className="dashboard-search-shortcut" aria-hidden="true">⌕</span>
          </label>
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-main-column">
            <section className="account-card" aria-labelledby="account-summary-title">
              <div className="account-card-topline">
                <div className="account-card-brand"><LedgerMark small /><span>LEDGER ACCOUNT</span></div>
                <span className="account-secure"><span aria-hidden="true" /> Secure</span>
              </div>

              <div className="account-card-balance">
                <p id="account-summary-title">Total paid</p>
                <div className="account-card-amount"><span>GHS</span>{formatMoney(totalPaid)}</div>
                <p className="account-card-caption">
                  Across {transactionCount} {transactionCount === 1 ? "payment" : "payments"}
                </p>
              </div>

              <div className="account-card-actions">
                <a className="account-action account-action--primary" href="#make-payment">
                  <span className="account-action-icon" aria-hidden="true">+</span>
                  Make a payment
                </a>
                <a className="account-action account-action--secondary" href="#activity">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7" /><path d="M4 4v4.7h4.7M12 7v5l3 2" /></svg>
                  View activity
                </a>
              </div>

              <div className="account-card-footer">
                <span>PAYMENT SUMMARY</span>
                <span>{statsLoading ? "Updating…" : "Up to date"}</span>
              </div>
            </section>

            <section className="quick-actions" aria-label="Quick actions">
              <a className="quick-action" href="#make-payment">
                <span className="quick-action-icon quick-action-icon--green" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
                <span><strong>Pay securely</strong><small>Continue with Paystack</small></span>
                <span className="quick-action-arrow" aria-hidden="true">↗</span>
              </a>
              <Link className="quick-action" href="/settings">
                <span className="quick-action-icon quick-action-icon--blue" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.3" /><path d="M5 20a7 7 0 0 1 14 0M19 8h2m-1-1v2" /></svg>
                </span>
                <span><strong>Account settings</strong><small>Manage your profile</small></span>
                <span className="quick-action-arrow" aria-hidden="true">↗</span>
              </Link>
            </section>

            <section className="overview-section" id="overview" aria-labelledby="overview-heading">
              <div className="section-heading">
                <div>
                  <p className="dashboard-eyebrow">AT A GLANCE</p>
                  <h2 id="overview-heading">Overview</h2>
                </div>
                <span className="section-period">All time</span>
              </div>
              <StatsGrid stats={stats} loading={statsLoading} />
            </section>

            <section className="payment-section" id="make-payment" aria-label="Make a payment">
              <PaymentForm onInitiated={() => { loadTransactions(); loadStats(); }} />
            </section>
          </div>

          <aside className="dashboard-side-column">
            <section className="activity-panel" id="activity" aria-labelledby="activity-heading">
              <div className="section-heading activity-heading">
                <div>
                  <p className="dashboard-eyebrow">YOUR LATEST PAYMENTS</p>
                  <h2 id="activity-heading">Recent activity</h2>
                </div>
                <StatusFilter
                  value={status}
                  onChange={(value) => { setStatus(value); setPage(1); }}
                />
              </div>

              <TransactionList
                payments={filteredPayments}
                loading={txLoading}
                emptyMessage={search.trim() ? "No payments match your search." : undefined}
              />

              {!txLoading && pages > 1 && (
                <div className="dashboard-pagination">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page">←</button>
                  <span>Page {page} of {pages}</span>
                  <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} aria-label="Next page">→</button>
                </div>
              )}
            </section>

            <div className="security-note">
              <span className="security-note-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 19 6v5c0 4.8-3 8-7 10-4-2-7-5.2-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <span><strong>Your payments stay protected</strong><small>Payments are processed securely through Paystack.</small></span>
            </div>
          </aside>
        </div>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        <a className="mobile-nav-item mobile-nav-item--active" href="#home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 19.5v-9Z" /><path d="M9 21v-7h6v7" /></svg>
          <span>Home</span>
        </a>
        <a className="mobile-nav-item" href="#make-payment">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span>Pay</span>
        </a>
        <a className="mobile-nav-item" href="#activity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4v16h15M8 15l3.5-4 3 2 4.5-6" /></svg>
          <span>Activity</span>
        </a>
        <Link className="mobile-nav-item" href="/settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
          <span>Account</span>
        </Link>
      </nav>
    </main>
  );
}

