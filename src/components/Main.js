import "../css/Main.css";
import "../css/seoPerformance.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoPerformance from "./seoPerformance";

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
      // Fetch your SEO backend data
      const res = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSeoData(data);

      // Fetch Google PageSpeed Insights
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&key=AIzaSyAZCIYhuH59SFasuRg9osspJIAz5K3IwyU&strategy=mobile`;
      const psiRes = await fetch(psiUrl);
      if (psiRes.ok) {
        const psiData = await psiRes.json();
        const lighthouse = psiData.lighthouseResult;

        setPageSpeed(lighthouse?.categories?.performance?.score * 100);

        const audits = lighthouse?.audits || {};
        const metrics =
          lighthouse?.audits["metrics"]?.details?.items?.[0] || {};

        setSeoData((prev) => ({
          ...prev,
          pageSpeed: {
            fcp: metrics.firstContentfulPaint,
            lcp: metrics.largestContentfulPaint,
            tti: metrics.interactive,
            speedIndex: metrics.speedIndex,
            tbt: metrics.totalBlockingTime,
            cls: audits["cumulative-layout-shift"]?.numericValue,
            fid: audits["max-potential-fid"]?.numericValue,
            opportunities: lighthouse?.audits
              ? Object.values(lighthouse.audits)
                  .filter((a) => a.details?.type === "opportunity")
                  .map((a) => ({
                    title: a.title,
                    savingsMs: a.details.overallSavingsMs,
                  }))
              : [],
          },
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch SEO data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="main-container">
        <div className="animation-seo">
          <DotLottieReact
            src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
            loop
            autoplay
          />
        </div>

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
            <div className="loader"></div>
            <p>Analyzing website, please wait...</p>
          </div>
        )}

        {!isLoading && isSubmitted && seoData && (
          <div className="results-container">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <h1>Overview</h1>

                {/* Existing backend SEO score */}
                <p>
                  SEO Score: {seoData.overview.score} / {seoData.overview.maxScore}
                </p>
                <progress
                  value={seoData.overview.score}
                  max={seoData.overview.maxScore}
                ></progress>

                {/* NEW: PageSpeed Performance Score */}
                {pageSpeed !== null && (
                  <p>
                    Performance Score: {pageSpeed} / 100
                  </p>
                )}
              </>
            )}

            {/* SEO Onpage */}
            {activeTab === "seo-onpage" && (
              <>
                <h1>SEO Onpage</h1>
                <p><b>Title:</b> {seoData.onpage.title}</p>
                <p><b>Meta Description:</b> {seoData.onpage.metaDescription}</p>
                <p><b>H1:</b> {seoData.onpage.h1.join(", ")}</p>
                <p><b>H2:</b> {seoData.onpage.h2.join(", ")}</p>
                <p><b>H3:</b> {seoData.onpage.h3.join(", ")}</p>
                <p><b>Images:</b> {seoData.onpage.imageCount} (with alt: {seoData.onpage.imagesWithAlt})</p>
                <p><b>Internal Links:</b> {seoData.onpage.internalLinks}</p>
                <p><b>Canonical:</b> {seoData.onpage.canonical}</p>
              </>
            )}

            {/* SEO Technical */}
            {activeTab === "seo-technical" && (
              <>
                <h1>SEO Technical</h1>
                <p>Technical analysis coming soon...</p>
              </>
            )}

            {/* SEO Offpage */}
            {activeTab === "seo-offpage" && (
              <>
                <h1>SEO Offpage</h1>
                <p>Off-page analysis coming soon...</p>
              </>
            )}

            {/* SEO Performance */}
            {activeTab === "seo-performance" && (
              <SeoPerformance pageSpeedData={seoData.pageSpeed} score={pageSpeed} />
            )}

          {/* View Leads */}
            {activeTab === "seo-viewleads" && (
              <>
                <h1>Lead Management Dashboard</h1>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Main;