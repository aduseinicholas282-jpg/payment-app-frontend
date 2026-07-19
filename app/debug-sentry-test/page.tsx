"use client";

export default function DebugSentryTestPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <button
        onClick={() => {
          throw new Error("Frontend Sentry verification error");
        }}
        className="glow-btn text-white rounded-lg px-6 py-3 text-sm font-semibold"
        style={{ "--btn-color": "var(--error)", "--btn-glow": "var(--error-glow)" } as React.CSSProperties}
      >
        Trigger test error
      </button>
    </main>
  );
}
