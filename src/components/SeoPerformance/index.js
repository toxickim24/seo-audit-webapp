import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./SeoPerformance.module.css";
import { fetchSeoPerformance } from "../../api/SeoPerformance";

function SeoPerformance({ url }) {
  const [desktopData, setDesktopData] = useState(null);
  const [mobileData, setMobileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const desktop = await fetchSeoPerformance(url, "desktop");
        setDesktopData(desktop);

        const mobile = await fetchSeoPerformance(url, "mobile");
        setMobileData(mobile);
      } catch (error) {
        console.error("❌ Error fetching SEO Performance:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [url]);

  const renderMetric = (label, value, unit, desc) => (
    <div className={styles.metricCard}>
      <h4>{label}</h4>
      <p className={styles.value}>
        {value !== undefined && value !== null ? `${value} ${unit}` : "N/A"}
      </p>
      <p className={styles.description}>{desc}</p>
    </div>
  );

  const renderRecommendations = (opportunities) => {
    if (!opportunities || opportunities.length === 0) return null;

    const filtered = opportunities.filter((opp) => opp.savingsMs > 0);
    if (filtered.length === 0) return null;

    return (
      <div className={styles.opportunities}>
        <h3>Recommendations</h3>
        <ul>
          {filtered.map((opp, i) => {
            const seconds = opp.savingsMs / 1000;
            let impact =
              opp.savingsMs > 1000
                ? "High impact ⚡"
                : opp.savingsMs > 200
                ? "Medium impact 👍"
                : "Low impact ✅";

            return (
              <li key={i}>
                {opp.title} — {impact} (about {seconds.toFixed(1)}s faster)
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderResults = (data, device) => {
    if (!data) return null;

    return (
      <div className={styles.resultBox}>
        <h2>{device}</h2>

        {/* Score */}
        <div className={styles.scoreBox}>
          <CircularProgressbar
            value={data.score ?? 0}
            text={data.score !== null ? `${data.score}%` : "N/A"}
            styles={buildStyles({
              textColor: "#2c3e50",
              pathColor:
                data.score >= 80 ? "green" : data.score >= 50 ? "orange" : "red",
              trailColor: "#eee",
            })}
          />
          <p className={styles.scoreLabel}>Performance Score</p>
        </div>

        {/* Metrics */}
        <div className={styles.metricsGrid}>
          {renderMetric("FCP", Math.round(data.fcp), "ms", "First Contentful Paint")}
          {renderMetric("LCP", Math.round(data.lcp), "ms", "Largest Contentful Paint")}
          {renderMetric("TTI", Math.round(data.tti), "ms", "Time to Interactive")}
          {renderMetric(
            "Speed Index",
            Math.round(data.speedIndex),
            "ms",
            "Page visually loads"
          )}
          {renderMetric("TBT", Math.round(data.tbt), "ms", "Total Blocking Time")}
          {renderMetric("CLS", data.cls?.toFixed(2), "", "Layout Stability")}
          {renderMetric("FID", Math.round(data.fid), "ms", "First Input Delay")}
        </div>

        {/* Recommendations */}
        {renderRecommendations(data.opportunities)}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1>SEO Performance Audit</h1>
      {!loading && (
        <div className={styles.twoColumn}>
          {renderResults(desktopData, "Desktop")}
          {renderResults(mobileData, "Mobile")}
        </div>
      )}
    </div>
  );
}

export default SeoPerformance;
