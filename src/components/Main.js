import "../css/Main.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null); // 👈 desktop score only
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
    setPageSpeed(null); // 👈 reset desktop score
    setDesktopPerf(null);
    setMobilePerf(null);

    try {
      // SEO On-Page Fetch
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/analyze?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setSeoData(data);

      // PageSpeed Fetch
      const desktop = await fetchSeoPerformance(url, "desktop");
      const mobile = await fetchSeoPerformance(url, "mobile");

      // store desktop score in pageSpeed (number only)
      setPageSpeed(desktop.score);
      setDesktopPerf(desktop);
      setMobilePerf(mobile);

      setSeoData((prev) => ({
        ...prev,
        pageSpeed: { desktop, mobile },
      }));
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
            <div className="book">
              <div className="book__pg-shadow"></div>
              <div className="book__pg"></div>
              <div className="book__pg book__pg--2"></div>
              <div className="book__pg book__pg--3"></div>
              <div className="book__pg book__pg--4"></div>
              <div className="book__pg book__pg--5"></div>
            </div>
            <p>Analyzing website, please wait...</p>
          </div>
        )}

        {!isLoading && isSubmitted && seoData && (
          <div className="results-container">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <h1>Overview</h1>
                <p>
                  SEO Score: {seoData.overview.score} /{" "}
                  {seoData.overview.maxScore}
                </p>
                <progress
                  value={seoData.overview.score}
                  max={seoData.overview.maxScore}
                ></progress>

                {/* Desktop performance score only */}
                {pageSpeed !== null && (
                  <p>Performance Score: {pageSpeed} / 100</p>
                )}
              </>
            )}

            {/* Onpage */}
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

            {/* Technical */}
            {activeTab === "seo-technical" && (
              <>
                <h1>SEO Technical</h1>
                <p>Technical analysis coming soon...</p>
              </>
            )}

            {/* Performance */}
            {activeTab === "seo-performance" && (
              <SeoPerformance
                desktopData={desktopPerf}
                mobileData={mobilePerf}
              />
            )}

            {/* Offpage */}
            {activeTab === "seo-offpage" && (
              <>
                <h1>SEO Offpage</h1>
                <p>Off-page analysis coming soon...</p>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Main;