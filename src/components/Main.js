import "../css/Main.css";
import "../css/Loader.css";
import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";
import SeoTechnicalDisplay from "./SeoTechnical/SeoTechnicalDisplay";
import SeoContentDisplay from "./SeoContent/SeoContentDisplay";
import Overview from "../components/Overview/Overview";
import PostOverview from "../components/PostOverview/PostOverview";
import { generateSeoPDF } from "../utils/generateSeoPDF";
import { generateAiSeoPDF } from "../utils/generateAiSeoPDF";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import { getOverallScore } from "../utils/calcOverallScore";
import SeoPricing from "./SeoPricing";
import SeoTools from "./SeoTools";
import LeadsManagement from "./LeadsManagement";
import SeoJourney from "../components/SeoJourney";
import GetFullReport from "../components/GetFullReport";

function SuccessNotification({ email, clearStatus }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="success-notification">
      <span>✅ Report sent! Check your inbox ({email})</span>
      <button
        className="close-btn"
        onClick={() => {
          setVisible(false);
          if (clearStatus) clearStatus();
        }}
      >
        ✕
      </button>
    </div>
  );
}

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

  // AI Audit
  const [aiAudit, setAiAudit] = useState(null);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditError, setAiAuditError] = useState("");

  // Journey
  const [journeyStep, setJourneyStep] = useState("enter");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const normalizeUrl = (rawUrl) => {
    if (!rawUrl) return "";
    let val = rawUrl.trim();
    if (!/^https?:\/\//i.test(val)) val = "https://" + val;
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
    setEmailStatus("");
    setEmailStatusType("");

    setJourneyStep("scanning");

    const normalized = normalizeUrl(url);
    setUrl(normalized);

    try {
      const res = await fetch(`${API_BASE_URL}/analyze?url=${encodeURIComponent(normalized)}`);
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

      setDesktopRecommendations((desktop?.opportunities || []).filter((opp) => opp.savingsMs > 0));
      setMobileRecommendations((mobile?.opportunities || []).filter((opp) => opp.savingsMs > 0));

      setJourneyStep("form");
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

    const newLead = { name, email, phone, company, website: url, overallScore, date: new Date().toISOString() };

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) throw new Error("Failed to save lead");

      setLeadCaptured(true);
      setError("");
      setJourneyStep("get-report");
    } catch (err) {
      console.error(err);
      setError("Failed to save lead.");
    }
  };

  const handleAiEmailPDF = async () => {
    if (!aiAudit || !url || !email || !name) {
      setEmailStatus("Missing details for email.");
      setEmailStatusType("error");
      return;
    }

    try {
      setIsEmailSending(true);
      setEmailStatus("");
      setEmailStatusType("");

      // ✅ Generate AI-enhanced PDF (only AI data, no scores/recos)
      const pdfBlob = generateAiSeoPDF(url, aiAudit, false);

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const res = await fetch(`${API_BASE_URL}/send-seo-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, pdfBlob: base64Data }),
      });

      if (!res.ok) throw new Error("Email failed");
      setEmailStatus("✅ Report emailed!");
      setEmailStatusType("success");
    } catch (err) {
      console.error("AI Email failed:", err);
      setEmailStatus("Failed to send email.");
      setEmailStatusType("error");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleAiAudit = async () => {
    if (!url) return;

    setAiAuditLoading(true);
    setAiAuditError("");

    try {
      const raw = {
        domain: url,
        scannedAt: new Date().toISOString(),
        overall: overallScore,
        categories: {
          onpage: seoData?.onpage,
          content: seoData?.contentSeo,
          technical: seoData?.technicalSeo,
        },
        performance: {
          desktop: desktopRecommendations,
          mobile: mobileRecommendations,
        },
      };

      const res = await fetch(`${API_BASE_URL}/openai/seo-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw), // ✅ send full raw audit
      });

      if (!res.ok) throw new Error("AI audit failed");
      const data = await res.json();
      if (!data.success) throw new Error("No analysis returned");

      setAiAudit(data.analysis);
    } catch (err) {
      console.error("AI Audit failed:", err);
      setAiAuditError("Failed to generate AI Audit");
    } finally {
      setAiAuditLoading(false);
    }
  };

  // Step 4 effect → run AI Audit once
  useEffect(() => {
    if (journeyStep === "get-report" && url && !aiAudit && !aiAuditLoading) {
      console.log("🔄 Running AI Audit for", url);
      handleAiAudit();
    }
  }, [journeyStep, url]); // ❗ only trigger on step/url change

  // Step 5 effect → auto-send email once
  useEffect(() => {
    if (journeyStep === "results" && aiAudit && !isEmailSending) {
      console.log("📧 Sending email report...");
      handleAiEmailPDF();
    }
  }, [journeyStep, aiAudit]); // ❗ only trigger when step changes to results

  return (
    <main className="main-layout">
      {activeTab !== "seo-pricing" && activeTab !== "seo-tools" && activeTab !== "leads-management" ? (
        <>
          <aside className="top-journey">
            <SeoJourney step={journeyStep} />
          </aside>

          <div className="content-area">
            <section className="main-container">
              {/* Step 1: Enter Website */}
              {!seoData && !isLoading && journeyStep === "enter" && (
                <>
                  <div className="animation-seo">
                    <DotLottieReact
                      src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
                      loop
                      autoplay
                    />
                  </div>

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
                </>
              )}

              {/* Step 2: Scanning (book loader preserved ✅) */}
              {isLoading && journeyStep === "scanning" && (
                <>
                  <div className="animation-seo">
                    <DotLottieReact
                      src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
                      loop
                      autoplay
                    />
                  </div>
                  <div className="loader-container">
                    <div className="book-wrapper">
                      {/* your book loader remains unchanged */}
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
                </>
              )}

              {/* Step 3: PostOverview */}
              {!isLoading && isSubmitted && seoData && !leadCaptured && journeyStep === "form" && (
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
              )}

              {/* Step 4: Confirm & Send Report */}
              {leadCaptured && journeyStep === "get-report" && (
                <GetFullReport
                  email={email}
                  name={name}
                  aiAudit={aiAudit}
                  aiAuditLoading={aiAuditLoading}
                  aiAuditError={aiAuditError}
                  handleAiAudit={handleAiAudit}
                  setJourneyStep={setJourneyStep}
                />
              )}

              {/* Step 5: Results */}
              {journeyStep === "results" && (
                <div className="results-container">
                  {isEmailSending ? (
                    <div className="loader-container email-loader">
                      <div className="loader"></div>
                      <p>Sending email, please wait...</p>
                    </div>
                  ) : (
                    <div className="body-tab-content">
                      {emailStatusType === "success" && (
                        <SuccessNotification
                          email={email}
                          clearStatus={() => setEmailStatusType("")}
                        />
                      )}
                      {emailStatusType === "error" && (
                        <p className="email-status error">{emailStatus}</p>
                      )}

                      <Overview
                        seoData={seoData}
                        pageSpeed={pageSpeed}
                        desktopRecommendations={desktopRecommendations}
                        mobileRecommendations={mobileRecommendations}
                        onScoreReady={setOverallScore}
                      />

                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setLeadCaptured(false);
                          setSeoData(null);
                          setUrl("");
                          setJourneyStep("enter");
                          setEmailStatus("");
                          setEmailStatusType("");
                          setAiAudit(null);
                        }}
                      >
                        🔄 Scan Another URL
                      </button>
                    </div>
                  )}
                </div>
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
