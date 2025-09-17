import "../css/Main.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seoData, setSeoData] = useState(null);

  const urlPattern = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;

  //Analyze On Page
  const handleAnalyze = async () => {
    if (!urlPattern.test(url)) {
      setError("Please enter a valid website.");
      setIsSubmitted(false);
      return;
    }

    setError("");
    setIsSubmitted(true);

    try {
      const res = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSeoData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch SEO data.");
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

        {isSubmitted && seoData && (
          <div className="results-container">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <h1>Overview</h1>
                <p>
                  Score: {seoData.overview.score} / {seoData.overview.maxScore}
                </p>
                <progress
                  value={seoData.overview.score}
                  max={seoData.overview.maxScore}
                ></progress>
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
          </div>
        )}
      </section>
    </main>
  );
}

export default Main;
