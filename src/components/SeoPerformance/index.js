import styles from "./SeoPerformance.module.css";

function SeoPerformance({ pageSpeedData, score }) {
  // Guard against missing data
  if (!pageSpeedData) {
    return <p>No PageSpeed data available. Please analyze first.</p>;
  }

  return (
    <div className={styles.seoPagespeed}>
      <h1>SEO Page Speed</h1>

      {/* Radial Gauge */}
      {score !== null ? (
        <div className={styles.radialScore}>
          <div
            className={`${styles.circle} ${
              score >= 90 ? styles.good : score >= 50 ? styles.average : styles.poor
            }`}
            style={{ "--percent": score }}
          >
            <div className={styles.inner}>
              <span>{score}</span>
              <small>/100</small>
            </div>
          </div>
          <p className={styles.label}>Performance Score</p>
        </div>
      ) : (
        <p>No Performance Score available</p>
      )}

      {/* Core Web Vitals */}
      <h3>Core Web Vitals</h3>
      <div className={styles.metric}>
        <label>LCP (Largest Contentful Paint)</label>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${
              pageSpeedData.lcp <= 2500
                ? styles.good
                : pageSpeedData.lcp <= 4000
                ? styles.average
                : styles.poor
            }`}
            style={{ width: `${Math.min((pageSpeedData.lcp / 10000) * 100, 100)}%` }}
          >
            {pageSpeedData.lcp || 0} ms
          </div>
        </div>
      </div>

      <div className={styles.metric}>
        <label>FID (First Input Delay)</label>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${
              pageSpeedData.fid <= 100
                ? styles.good
                : pageSpeedData.fid <= 300
                ? styles.average
                : styles.poor
            }`}
            style={{ width: `${Math.min((pageSpeedData.fid / 1000) * 100, 100)}%` }}
          >
            {pageSpeedData.fid || 0} ms
          </div>
        </div>
      </div>

      <div className={styles.metric}>
        <label>CLS (Cumulative Layout Shift)</label>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${
              pageSpeedData.cls <= 0.1
                ? styles.good
                : pageSpeedData.cls <= 0.25
                ? styles.average
                : styles.poor
            }`}
            style={{ width: `${Math.min(pageSpeedData.cls * 100, 100)}%` }}
          >
            {pageSpeedData.cls?.toFixed(2) || 0}
          </div>
        </div>
      </div>

      {/* Other Metrics */}
      <h3>Other Metrics</h3>
      {[
        { key: "fcp", label: "FCP (First Contentful Paint)" },
        { key: "tti", label: "TTI (Time To Interactive)" },
        { key: "speedIndex", label: "Speed Index" },
        { key: "tbt", label: "Total Blocking Time" },
      ].map((m) => (
        <div key={m.key} className={styles.metric}>
          <label>{m.label}</label>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${
                pageSpeedData[m.key] <= 2000
                  ? styles.good
                  : pageSpeedData[m.key] <= 4000
                  ? styles.average
                  : styles.poor
              }`}
              style={{
                width: `${Math.min((pageSpeedData[m.key] / 10000) * 100, 100)}%`,
              }}
            >
              {pageSpeedData[m.key] || 0} ms
            </div>
          </div>
        </div>
      ))}

      {/* Opportunities */}
      <h3>Opportunities</h3>
      <ul className={styles.opportunities}>
        {(pageSpeedData.opportunities || []).length > 0 ? (
          pageSpeedData.opportunities.map((op, i) => (
            <li key={i}>
              <span className={styles.opTitle}>{op.title}</span>
              <span className={styles.opValue}>{op.savingsMs} ms savings</span>
            </li>
          ))
        ) : (
          <li>No opportunities found</li>
        )}
      </ul>
    </div>
  );
}

export default SeoPerformance;
