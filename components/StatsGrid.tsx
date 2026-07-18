"use client";

import { Stats } from "@/lib/api";

function StatCard({
  label,
  value,
  accent,
  glow,
}: {
  label: string;
  value: string;
  accent: string;
  glow: string;
}) {
  return (
    <div
      className="glass-card rounded-xl p-4"
      style={{ "--card-glow": glow } as React.CSSProperties}
    >
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <p className={`font-display text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function StatsGrid({
  stats,
  loading,
}: {
  stats: Stats | null;
  loading: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 space-y-2">
            <div className="h-2.5 w-16 rounded skeleton" />
            <div className="h-5 w-12 rounded skeleton" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total paid",
      value: `GHS ${stats.totalPaid.toFixed(2)}`,
      accent: "text-teal",
      glow: "var(--teal-glow)",
    },
    {
      label: "Success rate",
      value: `${stats.successRate}%`,
      accent: "text-violet",
      glow: "var(--violet-glow)",
    },
    {
      label: "Transactions",
      value: String(stats.totalTransactions),
      accent: "text-ink",
      glow: "var(--teal-glow)",
    },
    stats.totalUsers !== undefined
      ? {
          label: "Users",
          value: String(stats.totalUsers),
          accent: "text-gold",
          glow: "var(--gold-glow)",
        }
      : {
          label: "Pending",
          value: String(stats.byStatus.pending),
          accent: "text-gold",
          glow: "var(--gold-glow)",
        },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}