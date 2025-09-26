import { useMemo, useEffect } from "react";
import styles from "./PostOverview.module.css";

function Gauge({ score }) {
  const pct = Math.max(0, Math.min(score ?? 0, 100)); // clamp 0–100

  return (
    <svg viewBox="0 0 240 140" className={styles.gauge}>
      <defs>
        <linearGradient id="seoGaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="0.6" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* background half-circle */}
      <path
        d="M30,110 A90,90 0 0 1 210,110"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="16"
        strokeLinecap="round"
        pathLength="100"
      />

      {/* progress, revealed by dasharray so it always aligns */}
      <path
        d="M30,110 A90,90 0 0 1 210,110"
        fill="none"
        stroke="url(#seoGaugeGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${pct} ${100 - pct}`}
        /* tiny offset hides the left start nub; bump to 1–2 if you still see it */
        strokeDashoffset="0.5"
      />

      <text x="120" y="80" textAnchor="middle" className={styles.gaugeValue}>
        {pct}%
      </text>
      <text x="120" y="102" textAnchor="middle" className={styles.gaugeLabel}>
        {pct < 40 ? "Needs Work" : pct < 70 ? "Moderate" : "Strong"}
      </text>
    </svg>
  );
}

function PostOverview({
  seoData,
  pageSpeed,
  onScoreReady,
  name,
  setName,
  email,
  setEmail,
  company,
  setCompany,
  phone,
  setPhone,
  handleLeadSubmit,
  error,
}) {
  // ✅ Compute overall score
  const overallScore = useMemo(() => {
    if (pageSpeed === null) return null;
    const scores = [
      seoData?.onpage?.overview?.score ?? 0,
      seoData?.contentSeo?.overview?.score ?? 0,
      seoData?.technicalSeo?.overview?.score ?? 0,
      pageSpeed,
    ];
    const validScores = scores.filter((s) => s > 0);
    return validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;
  }, [seoData, pageSpeed]);

  useEffect(() => {
    if (onScoreReady && overallScore !== null) {
      onScoreReady(overallScore);
    }
  }, [overallScore, onScoreReady]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎉 Great SEO Audit Complete!</h1>
      <span className={styles.subtitle}>
        Get your detailed PDF report delivered to your inbox
      </span>

      <div className={styles.contentWrapper}>
        {/* Left: Gauge + scores */}
        <div className={styles.left}>
          <h2 className={styles.sectionTitle}>Overall SEO Health</h2>
          {overallScore !== null && <Gauge score={overallScore} />}

          <div className={styles.cards}>
            <div className={styles.card}>
              <h3>On-Page SEO</h3>
              <p>{seoData?.onpage?.overview?.score ?? 0}%</p>
            </div>
            <div className={styles.card}>
              <h3>Content SEO</h3>
              <p>{seoData?.contentSeo?.overview?.score ?? 0}%</p>
            </div>
            <div className={styles.card}>
              <h3>Technical SEO</h3>
              <p>{seoData?.technicalSeo?.overview?.score ?? 0}%</p>
            </div>
            <div className={styles.card}>
              <h3>Performance SEO</h3>
              <p>{pageSpeed ?? 0}%</p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className={styles.right}>
          <h2>Get Your Free SEO Report</h2>
          <span className={styles.formSubtitle}>
            Enter your details to receive the comprehensive PDF report
          </span>
          <form onSubmit={handleLeadSubmit} className={styles.form}>
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Company (Optional)</label>
            <input
              type="text"
              placeholder="Enter your company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <label>Phone (Optional)</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button type="submit">Get My SEO Report</button>
            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.privacyNote}>
              🔒 We respect your privacy. Your information will only be used to
              send you the SEO report and relevant updates. You can unsubscribe
              at any time.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostOverview;
