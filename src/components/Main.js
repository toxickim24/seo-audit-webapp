import "../css/Main.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Basic URL Validation
  const urlPattern = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;

  const handleAnalyze = () => {
    if (!urlPattern.test(url)) {
      setError("Please enter a valid website.");
      setIsSubmitted(false);
      return;
    }
    setError("");
    setIsSubmitted(true);
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

        {/* Show results if URL was submitted */}
        {isSubmitted && (
          <div className="results-container">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <h1>Overview</h1>
                <p>Check your website SEO performance instantly.</p>
              </>
            )}

            {/* SEO Onpage */}
            {activeTab === "seo-onpage" && (
              <>
                <h1>SEO Onpage</h1>
                <p>Check your website SEO performance instantly.</p>
              </>
            )}

            {/* SEO Technical */}
            {activeTab === "seo-technical" && (
              <>
                <h1>SEO Technical</h1>
                <p>Here you can see all your leads...</p>
              </>
            )}

            {/* SEO Offpage */}
            {activeTab === "seo-offpage" && (
              <>
                <h1>SEO Offpage</h1>
                <p>Generate and view detailed reports.</p>
              </>
            )}

           
          </div>
        )}

        {/* Leads & Send PDF */}
        {activeTab === "lead-pdf" && (
            <>
            <h1>Leads & Send PDF</h1>
            <p>Generate and view detailed reports.</p>
            </>
        )}
      </section>
    </main>
  );
}

export default Main;
