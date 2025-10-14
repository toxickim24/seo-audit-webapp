import "../../css/Main.css";
import "../../css/Loader.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoJourney from "../../components/SeoJourney";
import PostOverview from "../../components/PostOverview/PostOverview";
import Overview from "../../components/Overview/Overview";
import GetFullReport from "../../components/GetFullReport";
import SeoPricing from "../../components/SeoPricing";
import SeoTools from "../../components/SeoTools";
import { fetchSeoPerformance } from "../../api/SeoPerformance";
import { getOverallScore } from "../../utils/calcOverallScore";
import { generateAiSeoPDF } from "../../utils/generateAiSeoPDF";

export default function PublicPartnerPage() {
  const { slug } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ===== Partner Data =====
  const [partner, setPartner] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const [partnerError, setPartnerError] = useState("");

  // ===== SEO Audit States =====
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null);
  const [overallScore, setOverallScore] = useState(null);
  const [journeyStep, setJourneyStep] = useState("enter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  // ===== Performance =====
  const [desktopPerf, setDesktopPerf] = useState(null);
  const [mobilePerf, setMobilePerf] = useState(null);

  // ===== AI Audit & Email =====
  const [aiAudit, setAiAudit] = useState(null);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditError, setAiAuditError] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailStatusType, setEmailStatusType] = useState("");

  // ===== Fetch Partner Data =====
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partners/${slug}`);
        if (!res.ok) throw new Error("Partner not found");
        const data = await res.json();
        setPartner(data);

        // apply partner theme
        document.documentElement.style.setProperty("--primary-color", data.primary_color || "#22354d");
        document.documentElement.style.setProperty("--secondary-color", data.secondary_color || "#fb6a45");
      } catch (err) {
        console.error("❌ Partner fetch failed:", err);
        setPartnerError("Partner not found or inactive.");
        document.documentElement.style.setProperty("--primary-color", "#22354d");
        document.documentElement.style.setProperty("--secondary-color", "#fb6a45");
      } finally {
        setPartnerLoading(false);
      }
    };
    fetchPartner();
  }, [slug]);

  // ===== Utility Functions =====
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

  // ===== Handle SEO Analyze =====
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
    setJourneyStep("scanning");

    const normalized = normalizeUrl(url);

    try {
      const res = await fetch(`${API_BASE_URL}/api/seo/analyze?url=${encodeURIComponent(normalized)}`);
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
      setJourneyStep("form");
    } catch (err) {
      console.error("❌ SEO analyze failed:", err);
      setError("Failed to analyze website.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Handle Lead Submit =====
  const handleLeadSubmit = async (e, partnerId = null) => {
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

    if (partnerId) newLead.partner_id = partnerId;

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });

      if (!res.ok) throw new Error("Failed to save lead");
      setLeadCaptured(true);
      setJourneyStep("get-report");
    } catch (err) {
      console.error("❌ Error saving lead:", err);
      setError("Failed to save lead.");
    }
  };

  // ===== Handle AI Audit =====
  const handleAiAudit = async () => {
    if (!url || !seoData || !pageSpeed) return;

    setAiAuditLoading(true);
    setAiAuditError("");

    try {
      const simplifyPerf = (perf) => {
        if (!perf) return null;
        return {
          strategy: perf.strategy,
          score: perf.score,
          metrics: {
            fcp: perf.fcp,
            lcp: perf.lcp,
            tti: perf.tti,
          },
          opportunities: (perf.opportunities || [])
            .filter((opp) => opp.savingsMs > 0)
            .map((opp) => ({
              title: opp.title,
              savingsMs: opp.savingsMs,
            })),
        };
      };

      const simplifiedDesktop = simplifyPerf(desktopPerf);
      const simplifiedMobile = simplifyPerf(mobilePerf);

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
          score: pageSpeed,
          desktop: simplifiedDesktop,
          mobile: simplifiedMobile,
        },
      };

      const res = await fetch(`${API_BASE_URL}/api/openai/seo-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI audit failed: ${res.status} ${errText}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error("No analysis returned");

      setAiAudit(data.analysis);
      setJourneyStep("results");
    } catch (err) {
      console.error("❌ AI Audit failed:", err);
      setAiAuditError("Failed to generate Audit Report");
    } finally {
      setAiAuditLoading(false);
    }
  };

  // ===== Handle AI Email PDF =====
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

      const pdfBlob = await generateAiSeoPDF(url, aiAudit, false, desktopPerf, mobilePerf, seoData);

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const safeUrl = String(url || "")
        .replace(/^https?:\/\//, "")
        .replace(/\W/g, "_");

      const res = await fetch(`${API_BASE_URL}/api/email/send-seo-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, pdfBlob: base64Data, safeUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Email API error:", err);
        throw new Error(err.error || err.hint || "Email failed");
      }

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

  // ===== Effects =====
  useEffect(() => {
    if (journeyStep === "get-report" && url && seoData && !aiAudit && !aiAuditLoading) {
      handleAiAudit();
    }
  }, [journeyStep, url, seoData]);

  useEffect(() => {
    if (journeyStep === "results" && aiAudit && !isEmailSending) {
      handleAiEmailPDF();
    }
  }, [journeyStep, aiAudit]);

  // ===== Render =====
  if (partnerLoading) return <p className="loading">Loading partner...</p>;
  if (!partner && partnerError)
    return (
      <main className="main-layout">
        <section className="main-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ color: "var(--primary-color)" }}>Partner Not Found</h2>
          <p style={{ marginTop: "10px", fontSize: "16px", color: "#555" }}>
            The partner link you tried to access doesn’t exist or is no longer active.
          </p>
          <a
            href="/seo-audit"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Go Back to SEO Audit
          </a>
        </section>
      </main>
    );

  return (
    <main className="main-layout">
      <section className="main-container">
        <aside className="top-journey">
          <SeoJourney step={journeyStep} />
        </aside>

        {/* Step 1: Animation + Input */}
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

        {/* Step 2: Loader */}
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

        {/* Step 3: Form */}
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
            handleLeadSubmit={(e) => handleLeadSubmit(e, partner?.id)}
            error={error}
            setJourneyStep={setJourneyStep}
            url={url}
          />
        )}

        {/* Step 4: AI Audit + Email */}
        {leadCaptured && journeyStep === "get-report" && (
          <GetFullReport
            email={email}
            name={name}
            aiAudit={aiAudit}
            aiAuditLoading={aiAuditLoading}
            aiAuditError={aiAuditError}
            handleAiAudit={handleAiAudit}
            setJourneyStep={setJourneyStep}
            url={url}
            seoData={seoData}
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
              <>
                {emailStatusType === "success" && (
                  <p className="success-message">{emailStatus}</p>
                )}
                {emailStatusType === "error" && (
                  <p className="error-message">{emailStatus}</p>
                )}

                <Overview
                  seoData={seoData}
                  pageSpeed={pageSpeed}
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
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
