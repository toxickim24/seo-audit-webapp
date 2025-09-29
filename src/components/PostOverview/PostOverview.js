import { useMemo, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import styles from "./PostOverview.module.css";

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
  setJourneyStep, // ✅ NEW: accept journey step updater
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
    if (setJourneyStep) {
      setJourneyStep("form"); // ✅ Highlight Submit Form step
    }
  }, [overallScore, onScoreReady, setJourneyStep]);

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
          {overallScore !== null && (
            <div className={styles.gaugeBox}>
              <GaugeChart
                id="post-overall-seo-gauge"
                nrOfLevels={20}
                percent={overallScore / 100}
                colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                arcWidth={0.3}
                textColor="#22354d"
                style={{ width: "clamp(200px, 60vw, 400px)" }}
              />

              {/* ✅ New Strength Label */}
              <p
                className={`${styles.gaugeStatus} ${
                  overallScore < 40
                    ? styles.statusRed
                    : overallScore < 70
                    ? styles.statusYellow
                    : styles.statusGreen
                }`}
              >
                {overallScore < 40
                  ? "Needs Work"
                  : overallScore < 70
                  ? "Moderate"
                  : "Strong"}
              </p>
            </div>
          )}

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
