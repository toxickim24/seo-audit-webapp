import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
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
  setJourneyStep,
  url,
}) {
  // ✅ Store final score so it doesn’t change on every keystroke
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    if (pageSpeed !== null) {
      const scores = [
        Number(seoData?.onpage?.overview?.score) || 0,
        Number(seoData?.contentSeo?.overview?.score) || 0,
        Number(seoData?.technicalSeo?.overview?.score) || 0,
        Number(pageSpeed) || 0,
      ];
      const validScores = scores.filter((s) => s > 0);
      const newScore = validScores.length
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      setFinalScore(newScore);

      if (onScoreReady) onScoreReady(newScore);
      if (setJourneyStep) setJourneyStep("form"); // ✅ Highlight Submit Form step
    }
  }, [seoData, pageSpeed, onScoreReady, setJourneyStep]);

  // ✅ Helper: score color
  const getScoreColor = (score) => {
    if (score < 40) return styles.statusRed;
    if (score < 70) return styles.statusYellow;
    return styles.statusGreen;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Good news — the SEO checkup for{" "}
        <span className={styles.url}>{url}</span> is done! 🎉
      </h1>
      {finalScore !== null && (
        <span className={`${styles.subtitle} ${getScoreColor(finalScore)}`}>
          Your site scored <b>{finalScore}</b>/100
        </span>
      )}
      <p className={styles.intro}>
        Want to see the full breakdown with fixes and opportunities? Just fill
        in the form below and we’ll email you your complete SEO report.
      </p>

      <div className={styles.contentWrapper}>
        {/* Left: Gauge + scores */}
        <div className={styles.left}>
          {finalScore !== null && (
            <div className={styles.gaugeBox}>
              <GaugeChart
                id="post-overall-seo-gauge"
                nrOfLevels={20}
                percent={finalScore / 100}
                animate={false} // ✅ stops moving on form input
                colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                arcWidth={0.3}
                needleColor="rgba(34, 53, 77, 0.7)"
                needleBaseColor="#22354d"
                textColor="#22354d"
                style={{ width: "clamp(200px, 60vw, 400px)" }}
              />
              <p
                className={`${styles.gaugeStatus} ${getScoreColor(finalScore)}`}
              >
                {finalScore < 40
                  ? "Needs Work"
                  : finalScore < 70
                  ? "Moderate"
                  : "Strong"}
              </p>
            </div>
          )}

          <div className={styles.cards}>
            <div className={styles.card}>
              <h3>On-Page SEO</h3>
              <div className={styles.progressWrapper}>
                <GaugeChart
                  id="gauge-onpage"
                  nrOfLevels={20}
                  percent={(Number(seoData?.onpage?.overview?.score) || 0) / 100}
                  animate={false}
                  colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                  arcWidth={0.3}
                  needleColor="rgba(34, 53, 77, 0.7)"
                  needleBaseColor="#22354d"
                  textColor="#22354d"
                  style={{
                    width: "clamp(140px, 30vw, 260px)",
                    height: "clamp(75px, 20vw, 180px)",
                    margin: "0 auto",
                  }}
                  formatTextValue={() =>
                    `${Number(seoData?.onpage?.overview?.score) || 0}%`
                  }
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>On-Page SEO</h3>
              <div className={styles.progressWrapper}>
                <GaugeChart
                  id="gauge-content"
                  nrOfLevels={20}
                  percent={(Number(seoData?.contentSeo?.overview?.score) || 0) / 100}
                  animate={false}
                  colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                  arcWidth={0.3}
                  needleColor="rgba(34, 53, 77, 0.7)"
                  needleBaseColor="#22354d"
                  textColor="#22354d"
                  style={{
                    width: "clamp(140px, 30vw, 260px)",
                    height: "clamp(75px, 20vw, 180px)",
                    margin: "0 auto",
                  }}
                  formatTextValue={() =>
                    `${Number(seoData?.contentSeo?.overview?.score) || 0}%`
                  }
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>On-Page SEO</h3>
              <div className={styles.progressWrapper}>
                <GaugeChart
                  id="gauge-technical"
                  nrOfLevels={20}
                  percent={(Number(seoData?.technicalSeo?.overview?.score) || 0) / 100}
                  animate={false}
                  colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                  arcWidth={0.3}
                  needleColor="rgba(34, 53, 77, 0.7)"
                  needleBaseColor="#22354d"
                  textColor="#22354d"
                  style={{
                    width: "clamp(140px, 30vw, 260px)",
                    height: "clamp(75px, 20vw, 180px)",
                    margin: "0 auto",
                  }}
                  formatTextValue={() =>
                    `${Number(seoData?.technicalSeo?.overview?.score) || 0}%`
                  }
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>On-Page SEO</h3>
              <div className={styles.progressWrapper}>
                <GaugeChart
                  id="gauge-performance"
                  nrOfLevels={20}
                  percent={(Number(pageSpeed) || 0) / 100}
                  animate={false}
                  colors={["#FF5F6D", "#FFC371", "#00C49F"]}
                  arcWidth={0.3}
                  needleColor="rgba(34, 53, 77, 0.7)"
                  needleBaseColor="#22354d"
                  textColor="#22354d"
                  style={{
                    width: "clamp(140px, 30vw, 260px)",
                    height: "clamp(75px, 20vw, 180px)",
                    margin: "0 auto",
                  }}
                  formatTextValue={() => `${Number(pageSpeed) || 0}%`}
                />
              </div>
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
