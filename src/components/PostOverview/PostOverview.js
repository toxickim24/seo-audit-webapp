import { useMemo, useEffect } from "react";
import AnimatedProgress from "../AnimatedProgress/AnimatedProgress";
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
  handleLeadSubmit, // coming from Main.js
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

  // ✅ Pass score up
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

      {/* Two-column layout */}
      <div className={styles.contentWrapper}>
        {/* Left: Overview results (scores only, no suggestions) */}
        <div className={styles.left}>
          <h2 className={styles.sectionTitle}>SEO Score Summary</h2>

          {overallScore !== null && (
            <AnimatedProgress
              score={overallScore}
              maxScore={100}
              label="Overall SEO Score"
            />
          )}

          {seoData?.onpage && (
            <AnimatedProgress
              score={seoData.onpage.overview?.score ?? 0}
              maxScore={100}
              label="On-Page SEO"
            />
          )}
          {seoData?.contentSeo && (
            <AnimatedProgress
              score={seoData.contentSeo.overview?.score ?? 0}
              maxScore={100}
              label="Content SEO"
            />
          )}
          {seoData?.technicalSeo && (
            <AnimatedProgress
              score={seoData.technicalSeo.overview?.score ?? 0}
              maxScore={100}
              label="Technical SEO"
            />
          )}
          {pageSpeed !== null && (
            <AnimatedProgress
              score={pageSpeed}
              maxScore={100}
              label="Performance SEO"
            />
          )}
        </div>

        {/* Right: Lead form */}
        <div className={styles.right}>
          <h2>Get Your Free SEO Report</h2>
          <span className={styles.formSubtitle}>
            Enter your details to receive the comprehensive PDF report
          </span>
          <form onSubmit={handleLeadSubmit} className={styles.form}>
            <label>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>
              Company (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter your company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <label>
              Phone (Optional)
            </label>
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
