import { useEffect, useMemo } from "react";
import GaugeChart from "react-gauge-chart";
import SeoSuggestions from "../SeoOnpage/SeoOnPageSuggestions";
import SeoTechnicalSuggestions from "../SeoTechnical/SeoTechnicalSuggestions";
import SeoContentSuggestions from "../SeoContent/SeoContentSuggestions";
import styles from "./Overview.module.css";

function Overview({ seoData, pageSpeed, desktopRecommendations, mobileRecommendations, onScoreReady }) {

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

  // ✅ Send score to parent
  useEffect(() => {
    if (onScoreReady && overallScore !== null) {
      onScoreReady(overallScore);
    }
  }, [overallScore, onScoreReady]);

  // ✅ Badge color based on score
  const getScoreClass = (score) => {
    if (score < 40) return styles.badgeRed;
    if (score < 70) return styles.badgeYellow;
    return styles.badgeGreen;
  };

  // Put these small helpers above the component (or above the function)
  const impactMeta = (ms = 0) =>
  ms > 1000
    ? { label: "High", statusCls: "statusHigh" }
    : ms > 200
    ? { label: "Medium", statusCls: "statusMedium" }
    : { label: "Low", statusCls: "statusLow" };

  // Simple keyword → icon color mapping (tweak as you like)
  const iconClassFor = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("javascript") || t.includes("css") || t.includes("render")) return "iconBlue";
    if (t.includes("redirect") || t.includes("blocking")) return "iconOrange";
    if (t.includes("alt") || t.includes("image")) return "iconGreen";
    return "iconGray";
  };

  // ✅ NEW renderer: icon first + impact pill + savings at right
  const renderPerformanceRecommendations = (recommendations, label) =>
  (recommendations?.length ?? 0) > 0 && (
    <div className={styles.seoRecommendations}>
      <h3>{label}</h3>
      <ul className={styles.perfList}>
        {recommendations.map((opp, i) => {
          const seconds = (opp.savingsMs / 1000).toFixed(1);
          const { label: impactLabel, statusCls } = impactMeta(opp.savingsMs);

          return (
            <li key={`${label}-${i}`} className={styles.perfItem}>
              <div className={styles.perfLeft}>
                <span className={`${styles.icon} ${styles[statusCls]}`} />
                <span className={styles.perfTitle}>{opp.title}</span>
              </div>

              <div className={styles.perfRight}>
                <span className={`${styles.impactBadge} ${styles[statusCls]}`}>
                  {impactLabel}
                </span>
                <span className={styles.savings}>+{seconds}s faster</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.overviewWrapper}>
        {/* Overall SEO Gauge */}
        {overallScore !== null && (
          <div className={styles.gaugeBox}>
            <GaugeChart
              id="overall-seo-gauge"
              nrOfLevels={20}
              percent={overallScore / 100}
              colors={["#FF5F6D", "#FFC371", "#00C49F"]}
              arcWidth={0.3}
              needleColor="rgba(34, 53, 77, 0.7)"
              needleBaseColor="#22354d"
              textColor="#22354d"
              style={{ width: "clamp(200px, 60vw, 500px)" }}
            />
            <h2 className={styles.overallText}>
              {/*{overallScore}%*/}
              <span>Overall SEO Score</span>
            </h2>
          </div>
        )}

        {/* Score Cards */}
        <div className={styles.scoreGrid}>
          {/* On-Page SEO */}
          <div className={styles.scoreCard}>
            <h4>On-Page SEO</h4>
            <GaugeChart
              id="gauge-onpage-overview"
              nrOfLevels={20}
              percent={(Number(seoData?.onpage?.overview?.score) || 0) / 100}
              colors={["#FF5F6D", "#FFC371", "#00C49F"]}
              arcWidth={0.3}
              needleColor="rgba(34, 53, 77, 0.7)"
              needleBaseColor="#22354d"
              textColor="#22354d"
              style={{
                width: "clamp(240px, 30vw, 240px)",
                height: "clamp(108px, 20vw, 108px)",
                margin: "0 auto",
              }}
              formatTextValue={() =>
                `${Number(seoData?.onpage?.overview?.score) || 0}%`
              }
            />
          </div>

          {/* Content SEO */}
          <div className={styles.scoreCard}>
            <h4>Content SEO</h4>
            <GaugeChart
              id="gauge-content-overview"
              nrOfLevels={20}
              percent={(Number(seoData?.contentSeo?.overview?.score) || 0) / 100}
              colors={["#FF5F6D", "#FFC371", "#00C49F"]}
              arcWidth={0.3}
              needleColor="rgba(34, 53, 77, 0.7)"
              needleBaseColor="#22354d"
              textColor="#22354d"
              style={{
                width: "clamp(240px, 30vw, 240px)",
                height: "clamp(108px, 20vw, 108px)",
                margin: "0 auto",
              }}
              formatTextValue={() =>
                `${Number(seoData?.contentSeo?.overview?.score) || 0}%`
              }
            />
          </div>

          {/* Technical SEO */}
          <div className={styles.scoreCard}>
            <h4>Technical SEO</h4>
            <GaugeChart
              id="gauge-technical-overview"
              nrOfLevels={20}
              percent={(Number(seoData?.technicalSeo?.overview?.score) || 0) / 100}
              colors={["#FF5F6D", "#FFC371", "#00C49F"]}
              arcWidth={0.3}
              needleColor="rgba(34, 53, 77, 0.7)"
              needleBaseColor="#22354d"
              textColor="#22354d"
              style={{
                width: "clamp(240px, 30vw, 240px)",
                height: "clamp(108px, 20vw, 108px)",
                margin: "0 auto",
              }}
              formatTextValue={() =>
                `${Number(seoData?.technicalSeo?.overview?.score) || 0}%`
              }
            />
          </div>

          {/* Performance SEO */}
          <div className={styles.scoreCard}>
            <h4>Performance SEO</h4>
            <GaugeChart
              id="gauge-performance-overview"
              nrOfLevels={20}
              percent={(Number(pageSpeed) || 0) / 100}
              colors={["#FF5F6D", "#FFC371", "#00C49F"]}
              arcWidth={0.3}
              needleColor="rgba(34, 53, 77, 0.7)"
              needleBaseColor="#22354d"
              textColor="#22354d"
              style={{
                width: "clamp(240px, 30vw, 240px)",
                height: "clamp(108px, 20vw, 108px)",
                margin: "0 auto",
              }}
              formatTextValue={() => `${Number(pageSpeed) || 0}%`}
            />
          </div>
        </div>

        {/* Suggestions + Recommendations (two columns) */}
        <div className={styles.suggestionsGrid}>
          {seoData?.onpage && (
            <div className={styles.seoSuggestions}>
              <SeoSuggestions
                onpage={seoData.onpage.onpage}
                contentSeo={seoData.contentSeo}
              />
            </div>
          )}

          {seoData?.technicalSeo && (
            <div className={styles.seoSuggestions}>
              <SeoTechnicalSuggestions
                technicalSeo={seoData.technicalSeo.technicalSeo}
              />
            </div>
          )}

          {seoData?.contentSeo && (
            <div className={styles.seoSuggestions}>
              <SeoContentSuggestions contentSeo={seoData.contentSeo.contentSeo} />
            </div>
          )}

          {/* Performance Recommendations */}
          {renderPerformanceRecommendations(desktopRecommendations, "Performance Recommendations Desktop")}
          {renderPerformanceRecommendations(mobileRecommendations, "Performance Recommendations Mobile")}

        </div>
      </div>
    </div>
  );
}

export default Overview;