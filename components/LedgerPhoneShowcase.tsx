export default function LedgerPhoneShowcase() {
  return (
    <section className="auth-showcase" aria-label="Ledger mobile app preview">
      <div className="auth-showcase-copy">
        <span className="auth-showcase-kicker">PAYMENTS, IN CLEAR VIEW</span>
        <h2>Payments.<br /><span>In one place.</span></h2>
        <p>See your activity, keep your records clear, and make every payment with confidence.</p>
        <div className="auth-showcase-trust"><span aria-hidden="true">✓</span> Secure payments, simply managed</div>
      </div>

      <div className="auth-phone-scene" aria-hidden="true">
        <div className="auth-phone-halo" />
        <div className="auth-phone">
          <div className="auth-phone-screen">
            <div className="auth-phone-notch" />
            <div className="auth-phone-status">
              <span>9:41</span>
              <span className="auth-phone-status-icons"><i /><i /><i /></span>
            </div>
            <div className="auth-phone-header">
              <span className="auth-phone-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4.5 7.5 7.5-3.5 7.5 3.5L12 11 4.5 7.5Z" />
                  <path d="m4.5 12 7.5 3.5 7.5-3.5M4.5 16.5 12 20l7.5-3.5" />
                </svg>
              </span>
              <span className="auth-phone-brand">LEDGER</span>
              <span className="auth-phone-avatar">L</span>
            </div>

            <div className="auth-phone-demo-label">SAMPLE APP PREVIEW</div>
            <div className="auth-phone-balance">
              <div className="auth-phone-balance-top"><span>Total paid</span><span>••••</span></div>
              <strong>GHS 2,840.00</strong>
              <small>Across 8 recent payments</small>
              <div className="auth-phone-actions">
                <span><i>＋</i> Pay</span>
                <span><i>↗</i> Activity</span>
              </div>
            </div>

            <div className="auth-phone-section-title"><strong>Recent payments</strong><span>View all</span></div>
            <div className="auth-phone-payment">
              <span className="auth-phone-payment-icon">↗</span>
              <span className="auth-phone-payment-copy"><strong>Mobile payment</strong><small>Today · 10:24</small></span>
              <span className="auth-phone-payment-amount">− GHS 120</span>
            </div>
            <div className="auth-phone-payment">
              <span className="auth-phone-payment-icon auth-phone-payment-icon--green">✓</span>
              <span className="auth-phone-payment-copy"><strong>Plan renewal</strong><small>Yesterday · 16:08</small></span>
              <span className="auth-phone-payment-amount">− GHS 45</span>
            </div>
            <div className="auth-phone-payment">
              <span className="auth-phone-payment-icon">＋</span>
              <span className="auth-phone-payment-copy"><strong>Payment received</strong><small>Yesterday · 09:32</small></span>
              <span className="auth-phone-payment-amount auth-phone-payment-amount--green">+ GHS 250</span>
            </div>

            <div className="auth-phone-bottom-nav"><span className="auth-phone-bottom-active">⌂</span><span>↗</span><span>◷</span><span>◎</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
