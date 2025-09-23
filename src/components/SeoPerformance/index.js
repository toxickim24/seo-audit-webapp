import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./SeoPerformance.module.css";
import { getOverallSpeedScore } from "../../utils/calcOverallSpeedScore"; // adjust path if needed

function SeoPerformance({ desktopData, mobileData }) {
  // Metric renderer with rating + explanation
  const renderMetric = (label, value, unit, desc, easyDesc, rating) => {
    const getBadge = () => {
      if (!rating) return null;
      if (rating === "good") return <span className={styles.badgeGood}>✅ Good</span>;
      if (rating === "needs") return <span className={styles.badgeNeeds}>⚠️ Needs Improvement</span>;
      if (rating === "poor") return <span className={styles.badgePoor}>❌ Poor</span>;
    };

    return (
      <div className={styles.metricCard}>
        <h4>{label}</h4>
        <p className={styles.value}>
          {value !== undefined && value !== null ? `${value} ${unit}` : "N/A"}
        </p>
        {getBadge()}
        <p className={styles.description}>{desc}</p>
        <p className={styles.easyExplanation}>{easyDesc}</p>
      </div>
    );
  };

  // Grouped recommendations (cards inside metricsGrid)
  const renderRecommendations = (desktopOpps = [], mobileOpps = []) => {
    const processOpps = (opps) =>
      opps
        .filter((opp) => opp.savingsMs > 0)
        .map((opp, i) => {
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
        });

    const desktopList = processOpps(desktopOpps);
    const mobileList = processOpps(mobileOpps);

    if (desktopList.length === 0 && mobileList.length === 0) return null;

    return (
      <div className={styles.opportunities}>
        <div className={styles.metricsGrid}>
          {desktopList.length > 0 && (
            <div className={styles.metricCard}>
              <h4>Desktop Recommendations</h4>
              <ul>{desktopList}</ul>
            </div>
          )}

          {mobileList.length > 0 && (
            <div className={styles.metricCard}>
              <h4>Mobile Recommendations</h4>
              <ul>{mobileList}</ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Results section for Desktop/Mobile (metrics only, no recos)
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
          {renderMetric(
            "First Contentful Paint (FCP)",
            Math.round(data.fcp),
            "ms",
            "When the first content (text or image) renders on screen.",
            "Tells you how quickly users see something appear after clicking.",
            data.fcp <= 1800 ? "good" : data.fcp <= 3000 ? "needs" : "poor"
          )}
          {renderMetric(
            "Largest Contentful Paint (LCP)",
            Math.round(data.lcp),
            "ms",
            "When the largest element becomes visible.",
            "Shows how fast the main part of the page loads for visitors.",
            data.lcp <= 2500 ? "good" : data.lcp <= 4000 ? "needs" : "poor"
          )}
          {renderMetric(
            "Time to Interactive (TTI)",
            Math.round(data.tti),
            "ms",
            "When the page is fully ready for user interaction.",
            "How long before someone can click or type without delay.",
            data.tti <= 3800 ? "good" : data.tti <= 7300 ? "needs" : "poor"
          )}
          {renderMetric(
            "Speed Index",
            Math.round(data.speedIndex),
            "ms",
            "How quickly content is visually displayed.",
            "Measures how fast the page looks like it’s loading.",
            data.speedIndex <= 3400 ? "good" : data.speedIndex <= 5800 ? "needs" : "poor"
          )}
          {renderMetric(
            "Total Blocking Time (TBT)",
            Math.round(data.tbt),
            "ms",
            "How long tasks block user input.",
            "Shorter times mean fewer lags when clicking around.",
            data.tbt <= 200 ? "good" : data.tbt <= 600 ? "needs" : "poor"
          )}
          {renderMetric(
            "Cumulative Layout Shift (CLS)",
            data.cls?.toFixed(2),
            "",
            "How much the layout shifts while loading.",
            "Low CLS = less annoying page jumps while reading or clicking.",
            data.cls <= 0.1 ? "good" : data.cls <= 0.25 ? "needs" : "poor"
          )}
          {renderMetric(
            "First Input Delay (FID)",
            Math.round(data.fid),
            "ms",
            "Delay when the user first interacts.",
            "How quickly the site responds the first time you click.",
            data.fid <= 100 ? "good" : data.fid <= 300 ? "needs" : "poor"
          )}
        </div>
      </div>
    );
  };

  // Calculate overall average score
  const overallSpeedScore = getOverallSpeedScore(desktopData?.score, mobileData?.score);

  return (
    <div className={styles.container}>
      <h2 className="result-title">SEO Performance Audit</h2>
      <div className={styles.threeColumn}>
        {/* Overall */}
        <div className={styles.resultBox}>
          <h2>Overall</h2>
          <div className={styles.scoreBox}>
            <CircularProgressbar
              value={overallSpeedScore ?? 0}
              text={overallSpeedScore !== null ? `${overallSpeedScore}%` : "N/A"}
              styles={buildStyles({
                textColor: "#2c3e50",
                pathColor:
                  overallSpeedScore >= 80 ? "green" : overallSpeedScore >= 50 ? "orange" : "red",
                trailColor: "#eee",
              })}
            />
            <p className={styles.scoreLabel}>Performance Score</p>
          </div>

          {/* Grouped Recommendations */}
          {renderRecommendations(desktopData?.opportunities, mobileData?.opportunities)}
        </div>

        {/* Desktop (metrics only) */}
        {renderResults(desktopData, "Desktop")}

        {/* Mobile (metrics only) */}
        {renderResults(mobileData, "Mobile")}
      </div>
    </div>
  );
}

export default SeoPerformance;
