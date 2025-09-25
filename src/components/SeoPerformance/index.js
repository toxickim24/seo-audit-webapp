import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./SeoPerformance.module.css";
import { getOverallSpeedScore } from "../../utils/calcOverallSpeedScore"; 

function SeoPerformance({ desktopData, mobileData, isPerfLoading }) {
  // Loader while performance data is still scanning
  if (isPerfLoading) {
    return (
      <div className="loader-container">
        <div className="book-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 126 75" className="book">
            <rect strokeWidth="5" stroke="#fb6a45" rx="7.5" height="70" width="121" y="2.5" x="2.5"></rect>
            <line strokeWidth="5" stroke="#fb6a45" y2="75" x2="63.5" x1="63.5"></line>
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M25 20H50"></path>
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M101 20H76"></path>
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M16 30L50 30"></path>
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M110 30L76 30"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff74" viewBox="0 0 65 75" className="book-page">
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M40 20H15"></path>
            <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M49 30L15 30"></path>
            <path strokeWidth="5" stroke="#fb6a45" d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z"></path>
          </svg>
        </div>
        <p>Fetching PageSpeed Insights… This may take up to a minute.</p>
      </div>
    );
  }

  // If nothing returned yet
  if (!desktopData && !mobileData) {
    return <p>No performance data available yet.</p>;
  }

  // Helper: render metric card
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

  // Recommendations
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

  // Metrics block
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
            "Tells you how quickly users see something appear.",
            data.fcp <= 1800 ? "good" : data.fcp <= 3000 ? "needs" : "poor"
          )}
          {renderMetric(
            "Largest Contentful Paint (LCP)",
            Math.round(data.lcp),
            "ms",
            "When the largest element becomes visible.",
            "Shows how fast the main part of the page loads.",
            data.lcp <= 2500 ? "good" : data.lcp <= 4000 ? "needs" : "poor"
          )}
          {renderMetric(
            "Time to Interactive (TTI)",
            Math.round(data.tti),
            "ms",
            "When the page is fully ready for interaction.",
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
            "Shorter times mean fewer lags.",
            data.tbt <= 200 ? "good" : data.tbt <= 600 ? "needs" : "poor"
          )}
          {renderMetric(
            "Cumulative Layout Shift (CLS)",
            data.cls?.toFixed(2),
            "",
            "How much the layout shifts while loading.",
            "Low CLS = less annoying jumps.",
            data.cls <= 0.1 ? "good" : data.cls <= 0.25 ? "needs" : "poor"
          )}
          {renderMetric(
            "First Input Delay (FID)",
            Math.round(data.fid),
            "ms",
            "Delay when the user first interacts.",
            "How quickly the site responds to first click.",
            data.fid <= 100 ? "good" : data.fid <= 300 ? "needs" : "poor"
          )}
        </div>
      </div>
    );
  };

  // Overall score
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
          {renderRecommendations(desktopData?.opportunities, mobileData?.opportunities)}
        </div>

        {/* Desktop */}
        {renderResults(desktopData, "Desktop")}

        {/* Mobile */}
        {renderResults(mobileData, "Mobile")}
      </div>
    </div>
  );
}

export default SeoPerformance;
