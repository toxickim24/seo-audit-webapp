import "../css/Main.css";
import "../css/Loader.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";
import SeoTechnicalDisplay from "./SeoTechnical/SeoTechnicalDisplay";
import SeoContentDisplay from "./SeoContent/SeoContentDisplay";
import Overview from "../components/Overview/Overview";
import PostOverview from "../components/PostOverview/PostOverview";
import { generateSeoPDF } from "../utils/generateSeoPDF";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import { getOverallScore } from "../utils/calcOverallScore";
import SeoPricing from "./SeoPricing";
import SeoTools from "./SeoTools";
import LeadsManagement from "./LeadsManagement";
import SeoJourney from "../components/SeoJourney"; // ✅ sidebar journey
import GetFullReport from "../components/GetFullReport";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null);
  const [desktopPerf, setDesktopPerf] = useState(null);
  const [desktopRecommendations, setDesktopRecommendations] = useState([]);
  const [mobileRecommendations, setMobileRecommendations] = useState([]);
  const [mobilePerf, setMobilePerf] = useState(null);
  const [overallScore, setOverallScore] = useState(null);

  // Lead form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Email status
  const [emailStatus, setEmailStatus] = useState("");
  const [emailStatusType, setEmailStatusType] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Secondary tabs after submission
  const [bodyTab, setBodyTab] = useState("overview");

  // Journey state
  const [journeyStep, setJourneyStep] = useState("enter");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const normalizeUrl = (rawUrl) => {
    if (!rawUrl) return "";
    let val = rawUrl.trim();
    if (!/^https?:\/\//i.test(val)) {
      val = "https://" + val;
    }
    return val;
  };

  const validateUrl = (rawUrl) => {
    if (!rawUrl || !rawUrl.trim()) return "Website URL cannot be empty.";
    try {
      const parsed = new URL(normalizeUrl(rawUrl));
      if (!parsed.hostname.includes(".")) return "Enter a valid domain.";
      if (/^(localhost|127\.|192\.168\.|10\.)/.test(parsed.hostname))
        return "Local/private URLs not allowed.";
      return null;
    } catch {
      return "Invalid website URL.";
    }
  };

  const handleAnalyze = async () => {
    const err = validateUrl(url);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setIsSubmitted(true);
    setIsLoading(true);
    setSeoData(null);
    setPageSpeed(null);
    setOverallScore(null);

    setJourneyStep("scanning"); // ✅ move to Scanning

    const normalized = normalizeUrl(url);
    setUrl(normalized);

    try {
      const res = await fetch(
        `${API_BASE_URL}/analyze?url=${encodeURIComponent(normalized)}`
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSeoData(data);

      const [desktop, mobile] = await Promise.all([
        fetchSeoPerformance(normalized, "desktop"),
        fetchSeoPerformance(normalized, "mobile"),
      ]);
      setDesktopPerf(desktop);
      setMobilePerf(mobile);

      const perfScore =
        desktop && mobile
          ? Math.round((desktop.score + mobile.score) / 2)
          : desktop?.score || mobile?.score || 0;
      setPageSpeed(perfScore);

      setOverallScore(getOverallScore(data));

      const desktopOpps = (desktop?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );
      const mobileOpps = (mobile?.opportunities || []).filter(
        (opp) => opp.savingsMs > 0
      );

      setDesktopRecommendations(desktopOpps);
      setMobileRecommendations(mobileOpps);

      setJourneyStep("form"); // ✅ after scan, show form step
    } catch (err) {
      console.error(err);
      setError("Failed to fetch SEO data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and Email are required.");
      return;
    }

    const newLead = {
      name,
      email,
      phone,
      company,
      website: url,
      overallScore,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) throw new Error("Failed to save lead");

      setLeadCaptured(true);
      setError("");
      setJourneyStep("get-report"); // ✅ go to Step 4
    } catch (err) {
      console.error(err);
      setError("Failed to save lead.");
    }
  };

  const handleDownloadPDF = () => {
    if (!seoData) return;
    setJourneyStep("report"); // 🔶 highlight report while working
    try {
      generateSeoPDF(
        seoData,
        url,
        overallScore,
        pageSpeed,
        { desktopData: desktopPerf, mobileData: mobilePerf },
        true
      );
      setJourneyStep("done"); // ✅ mark as completed
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailPDF = async () => {
    if (!seoData || !url || !email || !name) {
      setEmailStatus("Missing details for email.");
      setEmailStatusType("error");
      return;
    }

    // ✅ Stay in Step 4 during sending
    setJourneyStep("get-report");
    try {
      setIsEmailSending(true);
      const pdfBlob = generateSeoPDF(
        seoData,
        url,
        overallScore,
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
      const res = await fetch(`${API_BASE_URL}/send-seo-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pdfBlob: base64Data }),
      });
      if (!res.ok) throw new Error("Email failed");

      setEmailStatus("✅ Report emailed!");
      setEmailStatusType("success");
      // ⚠️ Do NOT auto-jump to step 5 — user must click "View Results"
    } catch (err) {
      console.error(err);
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
    <main className="main-layout">
      {activeTab !== "seo-pricing" &&
      activeTab !== "seo-tools" &&
      activeTab !== "leads-management" ? (
        <>
          <aside className="top-journey">
            <SeoJourney step={journeyStep} />
          </aside>

          <div className="content-area">
            <section className="main-container">
              {(!seoData || isLoading) && (
                <div className="animation-seo">
                  <DotLottieReact
                    src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
                    loop
                    autoplay
                  />
                </div>
              )}

              {!seoData && !isLoading && (
                <div className="search-box">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAnalyze();
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter your website URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <button type="submit">Run Your SEO Audit Now</button>
                    {error && <p className="error-message">{error}</p>}
                  </form>
                </div>
              )}

              {/* Loader DURING scan */}
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
                <>
                  {!leadCaptured ? (
                    <PostOverview
                      seoData={seoData}
                      pageSpeed={pageSpeed}
                      onScoreReady={setOverallScore}
                      name={name}
                      setName={setName}
                      email={email}
                      setEmail={setEmail}
                      company={company}
                      setCompany={setCompany}
                      phone={phone}
                      setPhone={setPhone}
                      handleLeadSubmit={handleLeadSubmit}
                      url={url}
                    />
                  ) : journeyStep === "get-report" ? (
                    <GetFullReport
                      email={email}
                      name={name}
                      handleEmailPDF={handleEmailPDF}
                      isEmailSending={isEmailSending}
                      emailStatus={emailStatus}
                      emailStatusType={emailStatusType}
                      onScanAnother={() => {
                        setLeadCaptured(false);
                        setSeoData(null);
                        setUrl("");
                        setJourneyStep("enter"); // go back to start
                      }}
                      onViewResults={() => setJourneyStep("done")} // go to final step
                    />
                  ) : journeyStep === "done" ? (
                    <div className="results-container">
                      <div className="body-tab-content">
                        <Overview
                          seoData={seoData}
                          pageSpeed={pageSpeed}
                          desktopRecommendations={desktopRecommendations}
                          mobileRecommendations={mobileRecommendations}
                          onScoreReady={setOverallScore}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </>
      ) : (
        <>
          {activeTab === "seo-pricing" && <SeoPricing />}
          {activeTab === "seo-tools" && <SeoTools />}
          {activeTab === "leads-management" && <LeadsManagement />}
        </>
      )}
    </main>
  );
}

export default Main;
