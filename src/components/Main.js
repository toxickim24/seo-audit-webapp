import "../css/Main.css";
import "../css/Loader.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AnimatedProgress from "../components/AnimatedProgress/AnimatedProgress";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import SeoSuggestions from "./SeoOnpage/SeoOnPageSuggestions";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";
import { getOverallScore } from "../utils/calcOverallScore";
import SeoTechnicalSuggestions from "./SeoTechnical/SeoTechnicalSuggestions";
import SeoTechnicalDisplay from "./SeoTechnical/SeoTechnicalDisplay";
import SeoContentSuggestions from "./SeoContent/SeoContentSuggestions";
import SeoContentDisplay from "./SeoContent/SeoContentDisplay";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null);
  const [desktopRecommendations, setDesktopRecommendations] = useState([]);
  const [mobileRecommendations, setMobileRecommendations] = useState([]);
  const [desktopPerf, setDesktopPerf] = useState(null);
  const [mobilePerf, setMobilePerf] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  const handleAnalyze = async () => {
    if (!urlPattern.test(url)) {
      setError("Please enter a valid website.");
      setIsSubmitted(false);
      return;
    }

    setError("");
    setIsSubmitted(true);
    setIsLoading(true);
    setSeoData(null);
    setPageSpeed(null);
    setDesktopPerf(null);
    setMobilePerf(null);

    try {
      // Fetch SEO analysis from backend
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/analyze?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      // Fetch PageSpeed Desktop + Mobile (parallel + cache)
      const { desktop, mobile } = await fetchSeoPerformance(url);

      setDesktopPerf(desktop);
      setMobilePerf(mobile);

      const overallScore = getOverallScore(desktop?.score, mobile?.score);
      setPageSpeed(overallScore);

      // filter opportunities (same as SeoPerformance)
      const desktopOpps = (desktop?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );
      const mobileOpps = (mobile?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );

      setDesktopRecommendations(desktopOpps);
      setMobileRecommendations(mobileOpps);

      // Merge all data into seoData state
      setSeoData({
        ...data,
        pageSpeed: { desktop, mobile },
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch SEO data.");
    } finally {
      setIsLoading(false);
    }
  };

  const passFailStyle = (pass) => ({
    backgroundColor: pass ? "lightgreen" : "#ff9999",
  });

  return (
    <main>
      <section className="main-container">
        {/* Animation */}
        <div className="animation-seo">
          <DotLottieReact
            src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
            loop
            autoplay
          />
        </div>

        {/* URL Input */}
        <div className="search-box">
          <input
            type="url"
            placeholder="Enter your website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={handleAnalyze}>Analyze SEO</button>
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="loader-container">
            <div className="book-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 126 75" className="book">
                <rect strokeWidth="5" stroke="#fb6a45" rx="7.5" height="70" width="121" y="2.5" x="2.5"></rect>
                <line strokeWidth="5" stroke="#fb6a45" y2="75" x2="63.5" x1="63.5" ></line>
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
            <p>Analyzing website, please wait...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && isSubmitted && seoData && (
          <div className="results-container">

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="overview-container">
                <div className="overview-wrapper">
                  <h2 className="result-title">Overview</h2>

                  {/* Overall SEO Score */}
                  {(() => {
                    const scores = [
                      seoData.onpage?.overview?.score,
                      seoData.contentSeo?.overview?.score,
                      seoData.technicalSeo?.overview?.score,
                      pageSpeed,
                    ].filter((s) => s !== undefined && s !== null);

                    const overallScore = scores.length
                      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                      : 0;

                    return (
                      <AnimatedProgress
                        score={overallScore}
                        maxScore={100}
                        label="Overall SEO Score"
                      />
                    );
                  })()}

                  {seoData.onpage && (
                    <AnimatedProgress
                      score={seoData.onpage.overview.score}
                      maxScore={100}
                      label="On-Page SEO"
                    />
                  )}
                  {seoData.contentSeo && (
                    <AnimatedProgress
                      score={seoData.contentSeo.overview?.score || 0}
                      maxScore={100}
                      label="Content SEO"
                    />
                  )}
                  {seoData.technicalSeo && (
                    <AnimatedProgress
                      score={seoData.technicalSeo.overview?.score || 0}
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

                  {/* SEO On Page Suggestions */}
                  {seoData.onpage && (
                    <SeoSuggestions onpage={seoData.onpage.onpage} contentSeo={seoData.contentSeo} />
                  )}

                  {/* Technical SEO Suggestions */}
                  {seoData.technicalSeo && (
                    <SeoTechnicalSuggestions technicalSeo={seoData.technicalSeo.technicalSeo} />
                  )}

                  {/* Content SEO Suggestions */}
                  {seoData.contentSeo && (
                    <SeoContentSuggestions contentSeo={seoData.contentSeo.contentSeo} />
                  )}

                  {/* Desktop Recommendations */}
                  {desktopRecommendations.length > 0 && (
                    <div className="seo-recommendations">
                      <h3>Performance Recommendations (Desktop)</h3>
                      <ul>
                        {desktopRecommendations.map((opp, i) => {
                          const seconds = opp.savingsMs / 1000;
                          let impact =
                            opp.savingsMs > 1000
                              ? "High impact ⚡"
                              : opp.savingsMs > 200
                              ? "Medium impact 👍"
                              : "Low impact ✅";

                          return (
                            <li key={`d-${i}`}>
                              {opp.title} — {impact} (about {seconds.toFixed(1)}s faster)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Mobile Recommendations */}
                  {mobileRecommendations.length > 0 && (
                    <div className="seo-recommendations">
                      <h3>Performance Recommendations (Mobile)</h3>
                      <ul>
                        {mobileRecommendations.map((opp, i) => {
                          const seconds = opp.savingsMs / 1000;
                          let impact =
                            opp.savingsMs > 1000
                              ? "High impact ⚡"
                              : opp.savingsMs > 200
                              ? "Medium impact 👍"
                              : "Low impact ✅";

                          return (
                            <li key={`m-${i}`}>
                              {opp.title} — {impact} (about {seconds.toFixed(1)}s faster)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* On-Page SEO */}
            {activeTab === "seo-onpage" && seoData.onpage && (
              <SeoOnPage onpage={seoData.onpage.onpage} passFailStyle={passFailStyle} />
            )}

            {/* Technical SEO */}
            {activeTab === "seo-technical" && seoData.technicalSeo && (
              <SeoTechnicalDisplay
                technicalSeo={seoData.technicalSeo.technicalSeo}
                passFailStyle={passFailStyle}
              />
            )}

            {/* Content SEO */}
            {activeTab === "seo-content" && seoData.contentSeo && (
              <SeoContentDisplay
                contentSeo={seoData.contentSeo.contentSeo}
                passFailStyle={passFailStyle}
              />
            )}

            {/* Performance */}
            {activeTab === "seo-performance" && (
              <SeoPerformance desktopData={desktopPerf} mobileData={mobilePerf} />
            )}

          </div>
        )}
      </section>
    </main>
  );
}

export default Main;
