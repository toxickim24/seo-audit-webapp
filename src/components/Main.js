import "../css/Main.css";
import "../css/Loader.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";
import SeoTechnicalDisplay from "./SeoTechnical/SeoTechnicalDisplay";
import SeoContentDisplay from "./SeoContent/SeoContentDisplay";
import Overview from "../components/Overview/Overview";
import { generateSeoPDF } from "../utils/generateSeoPDF";
import { getOverallScore } from "../utils/calcOverallScore";
import LeadsManagement from "./LeadsManagement";

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

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailStatusType, setEmailStatusType] = useState(""); // "success", "error", "info"
  const [isEmailSending, setIsEmailSending] = useState(false); // NEW

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

      const desktop = await fetchSeoPerformance(url, "desktop");
      const mobile = await fetchSeoPerformance(url, "mobile");

      setDesktopPerf(desktop);
      setMobilePerf(mobile);

      const overallScore = getOverallScore(desktop?.score, mobile?.score);
      setPageSpeed(overallScore);

      const desktopOpps = (desktop?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );
      const mobileOpps = (mobile?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );

      setDesktopRecommendations(desktopOpps);
      setMobileRecommendations(mobileOpps);

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

  const handleSendEmail = async () => {
    if (!seoData || !url || !email) {
      setEmailStatus("Email is missing");
      setEmailStatusType("error");
      return;
    }

    try {
      setIsEmailSending(true);
      setEmailStatus("");
      setEmailStatusType("");

      const pdfBlob = generateSeoPDF(
        seoData,
        url,
        pageSpeed,
        { desktopData: desktopPerf, mobileData: mobilePerf },
        false
      );

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const res = await fetch("http://localhost:5000/send-seo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pdfBlob: base64Data }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      setEmail("");
      setEmailStatus("SEO Audit Sent!");
      setEmailStatusType("success");
    } catch (err) {
      console.error("Send email error:", err);
      setEmailStatus("Failed to send email.");
      setEmailStatusType("error");
    } finally {
      setIsEmailSending(false);
    }
  };

  const passFailStyle = (pass) => ({
    backgroundColor: pass ? "lightgreen" : "#ff9999",
  });

  return (
    <main>
    {/* Default SEO tabs (all inside main-container) */}
    {activeTab !== "leads-management" && (
      <section className="main-container">
        <div className="animation-seo">
          <DotLottieReact
            src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
            loop
            autoplay
            onError={(err) => console.warn("Lottie error ignored:", err)}
            onLoad={(data) => console.log("Loaded .lottie", data)}
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

        {isLoading && (
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
            <p>Analyzing website, please wait...</p>
          </div>
        )}

        {!isLoading && isSubmitted && seoData && (
          <div className="results-container">

            {activeTab === "overview" && (
              <Overview
                seoData={seoData}
                pageSpeed={pageSpeed}
                desktopRecommendations={desktopRecommendations}
                mobileRecommendations={mobileRecommendations}
              />
            )}

            {activeTab === "seo-onpage" && seoData.onpage && (
              <SeoOnPage onpage={seoData.onpage.onpage} passFailStyle={passFailStyle} />
            )}

            {activeTab === "seo-technical" && seoData.technicalSeo && (
              <SeoTechnicalDisplay technicalSeo={seoData.technicalSeo.technicalSeo} passFailStyle={passFailStyle} />
            )}

            {activeTab === "seo-content" && seoData.contentSeo && (
              <SeoContentDisplay contentSeo={seoData.contentSeo.contentSeo} passFailStyle={passFailStyle} />
            )}

            {activeTab === "seo-performance" && (
              <SeoPerformance desktopData={desktopPerf} mobileData={mobilePerf} />
            )}

            {activeTab === "download-pdf" && (
              <>
                <div className="email-sent-container">
                  
                  <div className="email-sent-card">
                    <h2>Claim Your Free SEO Audit</h2>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={handleSendEmail} disabled={isEmailSending}>
                      Get Report
                    </button>

                    {/* Loader for email sending */}
                    {isEmailSending && (
                      <div className="loader-container email-loader">
                        <div className="loader"></div>
                        <p>Sending email, please wait...</p>
                      </div>
                    )}

                    {emailStatus && (
                      <p className={`email-status ${emailStatusType}`}>
                        {emailStatus}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>
      )}
      
      {/* Leads Management outside main-container */}
      {activeTab === "leads-management" && <LeadsManagement />}
    </main>
  );
}

export default Main;