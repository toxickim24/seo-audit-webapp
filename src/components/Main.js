import "../css/Main.css";
import "../css/Loader.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AnimatedProgress from "../components/AnimatedProgress/AnimatedProgress";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import SeoSuggestions from "./SeoOnpage/SeoOnPageSuggestions";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null);
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

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/analyze?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      // Fetch PageSpeed separately
      const pageSpeedResults = await fetchSeoPerformance(url);

      setSeoData({ ...data, pageSpeed: pageSpeedResults });
      setPageSpeed(pageSpeedResults.score);
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

                  {/* SEO Suggestions */}
                  {seoData.onpage && (
                    <SeoSuggestions onpage={seoData.onpage.onpage} contentSeo={seoData.contentSeo} />
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
              <>
                <h2 className="result-title">Technical SEO</h2>
                <p><b>Canonical:</b> {seoData.technicalSeo.technicalSeo.canonical}</p>
                <p><b>Robots Meta:</b> {seoData.technicalSeo.technicalSeo.hasRobotsMeta ? "Yes" : "No"}</p>
                <p><b>&nbsp;&nbsp;Indexable:</b> {seoData.technicalSeo.technicalSeo.robotsIndex}</p>
                <p><b>&nbsp;&nbsp;Follow Links:</b> {seoData.technicalSeo.technicalSeo.robotsFollow}</p>
                <p><b>Viewport Meta:</b> {seoData.technicalSeo.technicalSeo.hasViewport ? "Yes" : "No"}</p>
                <p><b>HTTPS:</b> {seoData.technicalSeo.technicalSeo.https ? "Yes" : "No"}</p>
                <p><b>Favicon:</b> {seoData.technicalSeo.technicalSeo.hasFavIcon ? "Yes" : "No"}</p>
                <p><b>Language Tag:</b> {seoData.technicalSeo.technicalSeo.hreflang ? "Yes" : "No"}</p>
                <p><b>Mixed Content:</b> {seoData.technicalSeo.technicalSeo.mixedContent ? "Yes" : "No"}</p>
                <p><b>Robots.txt URL:</b> <a href={seoData.technicalSeo.technicalSeo.robotsTxtUrl} target="_blank">{seoData.technicalSeo.technicalSeo.robotsTxtUrl}</a></p>
                {seoData.technicalSeo.technicalSeo.sitemapUrl && (
                  <p><b>Sitemap URL:</b> <a href={seoData.technicalSeo.technicalSeo.sitemapUrl} target="_blank">{seoData.technicalSeo.technicalSeo.sitemapUrl}</a></p>
                )}
                <p><b>Canonical Conflict:</b> {seoData.technicalSeo.technicalSeo.canonicalConflict ? "Yes" : "No"}</p>
                <p><b>WWW Version:</b> {seoData.technicalSeo.technicalSeo.isWWW ? "WWW" : "Non-WWW"}</p>
                <p><b>Trailing Slash:</b> {seoData.technicalSeo.technicalSeo.trailingSlash ? "Yes" : "No"}</p>
                <p><b>Page Size (KB):</b> {seoData.technicalSeo.technicalSeo.pageSizeKB}</p>
                <p><b>Number of Requests:</b> {seoData.technicalSeo.technicalSeo.numRequests}</p>
                <p><b>AMP Page:</b> {seoData.technicalSeo.technicalSeo.hasAMP ? "Yes" : "No"}</p>
                <p><b>Sitemap Valid URLs:</b></p>
                <ul>
                  {seoData.technicalSeo.technicalSeo.sitemapValidUrls.map((u, i) => (
                    <li key={i}>{u.url} - {u.status}</li>
                  ))}
                </ul>

              </>
            )}


            {/* Content SEO */}
            {activeTab === "seo-content" && seoData.contentSeo && (
              <>
                <h2 className="result-title">Content SEO</h2>
                <p><b>Word Count:</b> {seoData.contentSeo.contentSeo.wordCount}</p>
                <p><b>Keyword Density:</b> {seoData.contentSeo.contentSeo.keywordDensity}</p>
                <p><b>Body Length:</b> {seoData.contentSeo.contentSeo.bodyLength}</p>
                <p><b>Keyword in Headings:</b> {seoData.contentSeo.contentSeo.keywordInHeadings ? "Yes" : "No"}</p>
                <p><b>Media Count (img/video):</b> {seoData.contentSeo.contentSeo.mediaCount}</p>
              </>
            )}

            {/* Performance SEO */}
            {activeTab === "seo-performance" && seoData.pageSpeed && (
              <SeoPerformance pageSpeedData={seoData.pageSpeed} score={seoData.pageSpeed.score} />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Main;