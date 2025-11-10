import "../../css/Main.css";
import "../../css/Loader.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Helmet } from "react-helmet-async";
import GlobalLoader from "../../components/Loader";
import SeoJourney from "../../components/SeoJourney";
import PostOverview from "../../components/PostOverview/PostOverview";
import Overview from "../../components/Overview/Overview";
import GetFullReport from "../../components/GetFullReport";
import { fetchSeoPerformance } from "../../api/SeoPerformance";
import { getOverallScore } from "../../utils/calcOverallScore";
import { generateAiSeoPDF } from "../../utils/generateAiSeoPDF";
import { useAlert } from "../../utils/useAlert";

function SuccessNotification({ email, clearStatus }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
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
          clearStatus && clearStatus();
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function PublicPartnerPage() {
  const { success, error: showError, confirm } = useAlert();
  const { slug } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Partner Data
  const [partner, setPartner] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const [partnerError, setPartnerError] = useState("");

  // SEO Audit states
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [pageSpeed, setPageSpeed] = useState(null);
  const [desktopPerf, setDesktopPerf] = useState(null);
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
  const [simplifiedDesktop, setSimplifiedDesktop] = useState(null);
  const [simplifiedMobile, setSimplifiedMobile] = useState(null);

  const [journeyStep, setJourneyStep] = useState("enter");

  const [loadingDone, setLoadingDone] = useState(false);

  // ✅ Fetch Partner
  useEffect(() => {
    let isMounted = true;
    const fetchPartner = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partners/${slug}`);

        // ✅ Handle deleted/inactive partner (404)
        if (res.status === 404) {
          if (!isMounted) return;
          setPartnerError("Partner not found or inactive.");
          setPartner(null);
          document.documentElement.style.setProperty("--primary-color", "#22354d");
          document.documentElement.style.setProperty("--secondary-color", "#fb6a45");
          document.documentElement.style.setProperty("--accent-color", "#fb6a45");
          return;
        }

        // ✅ Handle other non-OK responses
        if (!res.ok) {
          if (!isMounted) return;
          console.warn("⚠️ Partner fetch returned non-OK status:", res.status);
          setPartnerError("Unable to load partner details.");
          setPartner(null);
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        if (data.is_deleted === 1) {
          setPartnerError("Partner not found or inactive.");
          setPartner(null);
          return;
        }

        // ✅ Success — apply colors
        setPartner(data);
        document.documentElement.style.setProperty(
          "--primary-color",
          data.primary_color || "#22354d"
        );
        document.documentElement.style.setProperty(
          "--secondary-color",
          data.secondary_color || "#fb6a45"
        );
        document.documentElement.style.setProperty(
          "--accent-color",
          data.accent_color || "#fb6a45"
        );
      } catch (err) {
        // ✅ Ignore expected 404 and log only unexpected errors
        if (!String(err).includes("404")) {
          console.warn("⚠️ Partner fetch failed:", err);
        }
        setPartnerError("Partner not found or inactive.");
        document.documentElement.style.setProperty("--primary-color", "#22354d");
        document.documentElement.style.setProperty("--secondary-color", "#fb6a45");
        document.documentElement.style.setProperty("--accent-color", "#fb6a45");
      } finally {
        if (isMounted) setPartnerLoading(false);
      }
    };

    fetchPartner();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // ============= Utility functions =============
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

  const simplifyPerf = (perf) => {
    if (!perf) return null;
    return {
      strategy: perf.strategy,
      score: perf.score,
      metrics: { fcp: perf.fcp, lcp: perf.lcp, tti: perf.tti },
      opportunities: (perf.opportunities || [])
        .filter((opp) => opp.savingsMs > 0)
        .map((opp) => ({ title: opp.title, savingsMs: opp.savingsMs })),
    };
  };

  // ============= SEO / Lead / AI Handlers =============
  const handleAnalyze = async () => {
    if (partner && partner.credits <= 0) {
      showError(
        "⚠️ You have no SEO audit credits left. Please contact support to purchase more credits."
      );
      return;
    }

    const err = validateUrl(url);
    if (err) return setError(err);

    setError("");
    setIsSubmitted(true);
    setIsLoading(true);
    setSeoData(null);
    setJourneyStep("scanning");

    const normalized = normalizeUrl(url);
    setUrl(normalized);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/seo/analyze?url=${encodeURIComponent(normalized)}&partner_id=${partner?.id || ""}`
      );
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403 && data.error?.includes("No credits")) {
          showError("⚠️ This partner has no SEO audit credits left. Please contact support to top up.");
          return;
        }
        throw new Error("Server error");
      }
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
      showError("Failed to analyze website.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return setError("Name and Email are required.");

    const newLead = {
      name,
      email,
      phone,
      company,
      website: url,
      score: overallScore,
      date: new Date().toISOString(),
    };
    if (partner?.id) newLead.partner_id = partner.id;

    try {
      const res = await fetch(`${API_BASE_URL}/api/partnerLeads`, {
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

  const handleAiAudit = async () => {
    if (!url || !pageSpeed || !desktopPerf || !mobilePerf) return;
    setAiAuditLoading(true);
    setAiAuditError("");
    try {
      const simplifiedDesktop = simplifyPerf(desktopPerf);
      const simplifiedMobile = simplifyPerf(mobilePerf);
      setSimplifiedDesktop(simplifiedDesktop);
      setSimplifiedMobile(simplifiedMobile);

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
      if (!res.ok) throw new Error("AI audit failed");
      const data = await res.json();
      if (!data.success) throw new Error("No analysis returned");
      setAiAudit(data.analysis);
    } catch (err) {
      console.error("❌ AI Audit failed:", err);
      setAiAuditError("Failed to generate Audit Report");
    } finally {
      setAiAuditLoading(false);
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
      const pdfBlob = await generateAiSeoPDF(
        url,
        aiAudit,
        false,
        simplifiedDesktop,
        simplifiedMobile,
        seoData,
        partner?.logo_url,
        partner?.company_name,
        partner?.primary_color
      );

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const safeUrl = String(url || "").replace(/^https?:\/\//, "").replace(/\W/g, "_");
      const res = await fetch(`${API_BASE_URL}/api/email/send-seo-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, pdfBlob: base64Data, safeUrl, company_name: partner?.company_name || "SEO Mojo", primary_color: partner?.primary_color, }),
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

  // Trigger AI audit + email
  useEffect(() => {
    if (journeyStep === "get-report" && url && !aiAudit && !aiAuditLoading) {
      handleAiAudit();
    }
  }, [journeyStep, url]);

  useEffect(() => {
    if (journeyStep === "results" && aiAudit && !isEmailSending) {
      handleAiEmailPDF();
    }
  }, [journeyStep, aiAudit]);

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Always keep loader visible for at least 2.5 s after page mount
    const minTimer = setTimeout(() => {
      if (!partnerLoading) setShowLoader(false);
    }, 2500);

    // If partner still loading after 2.5 s, hide only when done
    if (!partnerLoading) {
      const shortDelay = setTimeout(() => setShowLoader(false), 800);
      return () => clearTimeout(shortDelay);
    }

    return () => clearTimeout(minTimer);
  }, [partnerLoading]);

  useEffect(() => {
    const updateFavicon = (url) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // avoids CORS issues
      img.src = url;

      img.onload = () => {
        const size = 64; // favicon size
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // 🧠 DO NOT FILL BACKGROUND — preserve transparency

        // Fit image proportionally into square canvas
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Convert to PNG data URL
        const faviconURL = canvas.toDataURL("image/png");

        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }

        favicon.href = faviconURL;
      };

      img.onerror = () => {
        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }
        favicon.href = "/seo-icon.png";
      };
    };

    if (partner) {
      const logoUrl = partner.logo_url || "/seo-icon.png";
      updateFavicon(logoUrl);
    }
  }, [partner]);

  const root = document.documentElement;
  const primaryColor = getComputedStyle(root)
    .getPropertyValue("--primary-color")
    .trim()
    .toLowerCase();

  const isWhite =
    primaryColor === "#fff" ||
    primaryColor === "#ffffff" ||
    primaryColor === "white" ||
    primaryColor === "#f9f9f9" ||
    primaryColor === "#fafafa";

  document.body.setAttribute("data-primary-white", isWhite);

  if (showLoader) return <GlobalLoader visible={showLoader} partner={partner} />;

  if (partnerError) {
    return (
      <div className="partner-fallback">
        <div className="partner-fallback-content">
          <h2>Partner Not Available</h2>
          <p>
            This partner’s page is no longer active or has been removed.
            <br />
            <br />
            Please contact your administrator or try again later.
          </p>
          <a href="/" className="partner-fallback-btn">
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return (
  <>
    <Helmet>
      <title>
        {partner?.company_name
          ? `Free SEO Audit Tool | Analyse Your Website Instantly | ${partner.company_name}`
          : "Free SEO Audit Tool | Analyse Your Website Instantly | SEO Mojo by Web Design Davao"}
      </title>

      <link rel="icon" type="image/png" href={partner?.logo_url || "/seo-icon.png"} />

      <meta
        name="description"
        content={`Run a free SEO audit with ${partner?.company_name || "SEO Mojo"}. Discover what’s stopping your site from ranking higher and get a custom action plan in under a minute. Powered by Web Design Davao.`}
      />

      <meta property="og:title" content={partner?.company_name || "SEO Mojo"} />
      <meta property="og:image" content={partner?.logo_url || "/seo-logo.png"} />
      <meta property="og:description" content="Run your free SEO audit instantly and get AI-powered insights." />
    </Helmet>

    <main className="main-layout">

      <section className="main-container">
        {/* Step 1 */}
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

        {/* Step 2 */}
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
                  <rect strokeWidth="5" stroke="#fb6a45" rx="7.5" height="70" width="121" y="2.5" x="2.5" />
                  <line strokeWidth="5" stroke="#fb6a45" y2="75" x2="63.5" x1="63.5" />
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M25 20H50" />
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M101 20H76" />
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M16 30L50 30" />
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M110 30L76 30" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff74" viewBox="0 0 65 75" className="book-page">
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M40 20H15" />
                  <path strokeLinecap="round" strokeWidth="4" stroke="#22354d" d="M49 30L15 30" />
                  <path strokeWidth="5" stroke="#fb6a45" d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z" />
                </svg>
              </div>
              <p>Analyzing website, please wait...</p>
            </div>
          </>
        )}

        {/* Step 3 */}
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
            error={error}
            setJourneyStep={setJourneyStep}
            url={url}
          />
        )}

        {/* Step 4 */}
        {leadCaptured && journeyStep === "get-report" && (
          <GetFullReport
            email={email}
            name={name}
            aiAudit={aiAudit}
            aiAuditLoading={aiAuditLoading}
            aiAuditError={aiAuditError}
            handleAiAudit={handleAiAudit}
            handleAiEmailPDF={handleAiEmailPDF}
            setJourneyStep={setJourneyStep}
            url={url}
            simplifiedDesktop={simplifiedDesktop}
            simplifiedMobile={simplifiedMobile}
            seoData={seoData}
            partnerLogo={partner?.logo_url}
            partnerCompany={partner?.company_name}
            partnerPrimaryColor={partner?.primary_color}
          />
        )}

        {/* Step 5 */}
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

      <aside className="top-journey">
        <SeoJourney step={journeyStep} />
      </aside>

    </main>
  </>
  );
}
