"use client";

import { Stats } from "@/lib/api";

const cards = [
  {
    label: "Successful",
    value: (stats: Stats) => String(stats.byStatus.success),
    note: "completed payments",
    icon: "✓",
    accent: "metric-card--green",
  },
  {
    label: "Success rate",
    value: (stats: Stats) => `${stats.successRate}%`,
    note: "of all payments",
    icon: "%",
    accent: "metric-card--blue",
  },
  {
    label: "Pending",
    value: (stats: Stats) => String(stats.byStatus.pending),
    note: "awaiting confirmation",
    icon: "…",
    accent: "metric-card--amber",
  },
];

export default function StatsGrid({
  stats,
  loading,
}: {
  stats: Stats | null;
  loading: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="metrics-grid" aria-label="Loading payment overview" aria-busy="true">
        {cards.map((card) => (
          <div key={card.label} className="metric-card metric-card--loading">
            <span className="metric-skeleton metric-skeleton--label" />
            <span className="metric-skeleton metric-skeleton--value" />
            <span className="metric-skeleton metric-skeleton--note" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="metrics-grid">
      {cards.map((card) => (
        <article key={card.label} className={`metric-card ${card.accent}`}>
          <div className="metric-card-top">
            <span className="metric-card-icon" aria-hidden="true">{card.icon}</span>
            <span className="metric-card-label">{card.label}</span>
          </div>
          <p className="metric-card-value">{card.value(stats)}</p>
          <p className="metric-card-note">{card.note}</p>
        </article>
      ))}
    </div>
  );
}

