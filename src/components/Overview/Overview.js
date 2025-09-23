import { useEffect } from "react";
import AnimatedProgress from "../AnimatedProgress/AnimatedProgress";
import SeoSuggestions from "../SeoOnpage/SeoOnPageSuggestions";
import SeoTechnicalSuggestions from "../SeoTechnical/SeoTechnicalSuggestions";
import SeoContentSuggestions from "../SeoContent/SeoContentSuggestions";

function Overview({ seoData, pageSpeed, desktopRecommendations, mobileRecommendations, onScoreReady }) {

  const overallScore = (() => {
    const scores = [
      seoData.onpage?.overview?.score,
      seoData.contentSeo?.overview?.score,
      seoData.technicalSeo?.overview?.score,
      pageSpeed,
    ].filter((s) => s !== undefined && s !== null);

    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  useEffect(() => {
    if (onScoreReady) {
      onScoreReady(overallScore);
    }
  }, [overallScore, onScoreReady]);

  const renderPerformanceRecommendations = (recommendations, label) => (
    recommendations.length > 0 && (
      <div className="seo-recommendations">
        <h3>{label}</h3>
        <ul>
          {recommendations.map((opp, i) => {
            const seconds = opp.savingsMs / 1000;
            const impact =
              opp.savingsMs > 1000
                ? "High impact ⚡"
                : opp.savingsMs > 200
                ? "Medium impact 👍"
                : "Low impact ✅";

            return (
              <li key={`${label}-${i}`}>
                {opp.title} — {impact} (about {seconds.toFixed(1)}s faster)
              </li>
            );
          })}
        </ul>
      </div>
    )
  );

  return (
    <div className="overview-container">
      <div className="overview-wrapper">
        <h2 className="result-title">Overview</h2>

        {/* Overall SEO Score */}
        <AnimatedProgress score={overallScore} maxScore={100} label="Overall SEO Score" />

        {/* Individual Scores */}
        {seoData.onpage && <AnimatedProgress score={seoData.onpage.overview.score} maxScore={100} label="On-Page SEO" />}
        {seoData.contentSeo && <AnimatedProgress score={seoData.contentSeo.overview?.score || 0} maxScore={100} label="Content SEO" />}
        {seoData.technicalSeo && <AnimatedProgress score={seoData.technicalSeo.overview?.score || 0} maxScore={100} label="Technical SEO" />}
        {pageSpeed !== null && <AnimatedProgress score={pageSpeed} maxScore={100} label="Performance SEO" />}

        {/* Suggestions */}
        {seoData.onpage && <SeoSuggestions onpage={seoData.onpage.onpage} contentSeo={seoData.contentSeo} />}
        {seoData.technicalSeo && <SeoTechnicalSuggestions technicalSeo={seoData.technicalSeo.technicalSeo} />}
        {seoData.contentSeo && <SeoContentSuggestions contentSeo={seoData.contentSeo.contentSeo} />}

        {/* Performance Recommendations */}
        {renderPerformanceRecommendations(desktopRecommendations, "Performance Recommendations Desktop")}
        {renderPerformanceRecommendations(mobileRecommendations, "Performance Recommendations Mobile")}
      </div>
    </div>
  );
}

export default Overview;
