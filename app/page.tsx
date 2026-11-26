"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyTransactions, getMyStats, getMySubscriptions, initializeSubscription, cancelSubscription, LedgerSubscription, Payment, Stats } from "@/lib/api";
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "six-months" | "yearly">("monthly");
  const [subscriptions, setSubscriptions] = useState<LedgerSubscription[]>([]);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [txLoading, setTxLoading] = useState(true);
  const transactionRequestId = useRef(0);

  const loadTransactions = useCallback(() => {
    if (!token) return;
    const requestId = ++transactionRequestId.current;
    setTxLoading(true);
    getMyTransactions(token, status, page, search)
      .then((res) => {
        if (requestId !== transactionRequestId.current) return;
        setPayments(res.payments);
        setPages(res.pages);
      })
      .finally(() => {
        if (requestId === transactionRequestId.current) setTxLoading(false);
      });
  }, [token, status, page, search]);

  const loadStats = useCallback(() => {
    if (!token) return;
    setStatsLoading(true);
    getMyStats(token)
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, [token]);

  const loadSubscriptions = useCallback(() => {
    if (!token) return;
    getMySubscriptions(token).then((result) => setSubscriptions(result.subscriptions));
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(loadTransactions, search.trim() ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [loadTransactions, search]);
  useEffect(() => loadStats(), [loadStats]);
  useEffect(() => loadSubscriptions(), [loadSubscriptions]);

  async function beginSubscription(tier: LedgerSubscription["tier"]) {
    if (!token || subscriptionBusy) return;
    setSubscriptionBusy(true);
    setSubscriptionMessage(null);
    try {
      const result = await initializeSubscription(token, tier, billingPeriod);
      window.location.href = result.authorization_url;
    } catch (error) {
      setSubscriptionMessage(error instanceof Error ? error.message : "Unable to start subscription checkout.");
      setSubscriptionBusy(false);
    }
  }

  async function stopSubscription(id: string) {
    if (!token || subscriptionBusy) return;
    setSubscriptionBusy(true);
    setSubscriptionMessage(null);
    try {
      const result = await cancelSubscription(token, id);
      setSubscriptionMessage(result.message);
      loadSubscriptions();
    } catch (error) {
      setSubscriptionMessage(error instanceof Error ? error.message : "Unable to cancel renewal.");
    } finally {
      setSubscriptionBusy(false);
    }
  }

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
      <main className="auth-page auth-page--animated">
        <AuthForm />
      </main>
    );
  }

  const firstName = user.name.trim().split(/\s+/)[0] || "there";
  const totalPaid = stats?.totalPaid ?? 0;
  const transactionCount = stats?.totalTransactions ?? 0;
  const priceKey = billingPeriod === "monthly" ? "monthly" : billingPeriod === "six-months" ? "sixMonth" : "yearly";
  const plans = [
    { name: "Promotion", tier: "promotion" as const, prices: { monthly: 30, sixMonth: 150, yearly: 280 }, description: "A simple start for your account." },
    { name: "Gold", tier: "gold" as const, prices: { monthly: 70, sixMonth: 380, yearly: 700 }, description: "More room for regular payments." },
    { name: "Diamond", tier: "diamond" as const, prices: { monthly: 150, sixMonth: 800, yearly: 1500 }, description: "The complete Ledger experience." },
  ];

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
            <a className="dashboard-nav-link" href="#activity">Receipts</a>
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
              onChange={(event) => {
                transactionRequestId.current += 1;
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search all payments"
              aria-label="Search all payments by reference, email, amount or status"
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

              <div className="ledger-3d-stage" aria-hidden="true">
                <div className="ledger-3d-card">
                  <div className="ledger-3d-card-top">
                    <LedgerMark small />
                    <span className="ledger-3d-brand">LEDGER</span>
                    <span className="ledger-3d-signal"><i /><i /><i /></span>
                  </div>
                  <div className="ledger-3d-chip"><i /></div>
                  <div className="ledger-3d-lines"><i /><i /><i /></div>
                  <span className="ledger-3d-caption">SECURE PAYMENTS</span>
                </div>
              </div>

              <div className="account-card-actions">
                <a className="account-action account-action--primary" href="#make-payment">
                  <span className="account-action-icon" aria-hidden="true">+</span>
                  Make a payment
                </a>
                <a className="account-action account-action--secondary" href="#activity">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7" /><path d="M4 4v4.7h4.7M12 7v5l3 2" /></svg>
                  View receipts
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

            <section className="plans-section" aria-labelledby="plans-heading">
              <div className="section-heading">
                <div>
                  <p className="dashboard-eyebrow">LEDGER MEMBERSHIP</p>
                  <h2 id="plans-heading">Choose a subscription plan</h2>
                </div>
                <label className="plan-period-control">
                  <span className="sr-only">Billing period</span>
                  <select value={billingPeriod} onChange={(event) => setBillingPeriod(event.target.value as typeof billingPeriod)}>
                    <option value="monthly">Monthly</option>
                    <option value="six-months">6 Months</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>
              <p className="plans-note">Your card is charged automatically at the displayed price each period. Turn off renewal anytime. Checkout is secured by Paystack.</p>
              {subscriptions.filter((item) => ["active", "attention", "non-renewing"].includes(item.status)).map((subscription) => (
                <div className="subscription-current" key={subscription._id}>
                  <span><strong>{subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</strong> · {subscription.status === "non-renewing" ? "Ends after this period" : subscription.status === "attention" ? "Payment needs attention" : "Active"}<small>{subscription.nextPaymentDate ? `${subscription.isRecurring && subscription.status !== "non-renewing" ? "Next billing date" : "Plan ends"}: ${new Date(subscription.nextPaymentDate).toLocaleDateString()}` : subscription.isRecurring ? "Renewal schedule managed securely by Paystack" : "Fixed-term plan"}</small></span>
                  {subscription.isRecurring && subscription.canCancel && subscription.status !== "non-renewing" && <button type="button" disabled={subscriptionBusy} onClick={() => stopSubscription(subscription._id)}>Turn off renewal</button>}
                </div>
              ))}
              {subscriptionMessage && <p className="subscription-message" role="status">{subscriptionMessage}</p>}
              <div className="plan-cards">
                {plans.map((plan) => (
                  <article className={`plan-card${subscriptions.some((item) => ["active", "attention", "non-renewing"].includes(item.status)) ? " plan-card--disabled" : ""}`} key={plan.name}>
                    <span className="plan-card-name">{plan.name}</span>
                    <p className="plan-card-description">{plan.description}</p>
                    <p className="plan-price"><span>GHS</span> {formatMoney(plan.prices[priceKey])} <small>/ {billingPeriod === "monthly" ? "month" : billingPeriod === "six-months" ? "6 months" : "year"}</small></p>
                    <button type="button" className="plan-subscribe" disabled={subscriptionBusy || subscriptions.some((item) => ["active", "attention", "non-renewing"].includes(item.status))} onClick={() => beginSubscription(plan.tier)}>
                      {subscriptionBusy ? "Opening checkout…" : "Subscribe"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="payment-section" id="make-payment" aria-label="Make a payment">
              <PaymentForm onInitiated={() => { loadTransactions(); loadStats(); }} />
            </section>
          </div>

          <aside className="dashboard-side-column">
            <section className="activity-panel" id="activity" aria-labelledby="activity-heading">
              <div className="section-heading activity-heading">
                <div>
                  <p className="dashboard-eyebrow">YOUR PAYMENT RECORDS</p>
                  <h2 id="activity-heading">Receipt vault</h2>
                  <p className="receipt-vault-description">Open a payment to save or share its receipt.</p>
                </div>
                <StatusFilter
                  value={status}
                  onChange={(value) => { setStatus(value); setPage(1); }}
                />
              </div>

              <TransactionList
                payments={payments}
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
          <span>Receipts</span>
        </a>
        <Link className="mobile-nav-item" href="/settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
          <span>Account</span>
        </Link>
      </nav>
    </main>
  );
}
