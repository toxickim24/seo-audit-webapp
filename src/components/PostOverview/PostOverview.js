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
  url,
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

  // ✅ Helper: score color
  const getScoreColor = (score) => {
    if (score < 40) return styles.statusRed;
    if (score < 70) return styles.statusYellow;
    return styles.statusGreen;
  };

  return (
    <div className={styles.container}>
      {/* ✅ New headline */}
      <h1 className={styles.title}>
        Good news — the SEO checkup for <span className={styles.url}>{url}</span> is done! 🎉
      </h1>
      {overallScore !== null && (
        <span className={`${styles.subtitle} ${getScoreColor(overallScore)}`}>
          Your site scored <b>{overallScore}</b>/100.
        </span>
      )}
      <p className={styles.intro}>
        Want to see the full breakdown with fixes and opportunities? Just fill
        in the form and we’ll email you your complete SEO report.
      </p>

      <div className={styles.contentWrapper}>
        {/* Left: Gauge + scores */}
        <div className={styles.left}>
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

              {/* ✅ Strength Label */}
              <p
                className={`${styles.gaugeStatus} ${getScoreColor(overallScore)}`}
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
          <h2>Get Your Complete SEO Report</h2>
          <span className={styles.formSubtitle}>
            Enter your details below and we’ll send the full PDF with fixes and
            opportunities straight to your inbox.
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

            <button type="submit">📩 Send Me My Report</button>
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
