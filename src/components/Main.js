import "../css/Main.css";
import "../css/Loader.css";
import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SeoOnPage from "./SeoOnpage/SeoOnpageDisplay";
import SeoTechnicalDisplay from "./SeoTechnical/SeoTechnicalDisplay";
import SeoContentDisplay from "./SeoContent/SeoContentDisplay";
import Overview from "../components/Overview/Overview";
import { generateSeoPDF } from "../utils/generateSeoPDF";
import SeoPerformance from "./SeoPerformance";
import { fetchSeoPerformance } from "../api/SeoPerformance";
import { getOverallScore } from "../utils/calcOverallScore";
import LeadsManagement from "./LeadsManagement";

function Main({ activeTab }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seoData, setSeoData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPerfLoading, setIsPerfLoading] = useState(false);

  const [pageSpeed, setPageSpeed] = useState(null);
  const [desktopRecommendations, setDesktopRecommendations] = useState([]);
  const [mobileRecommendations, setMobileRecommendations] = useState([]);
  const [desktopPerf, setDesktopPerf] = useState(null);
  const [mobilePerf, setMobilePerf] = useState(null);

  const [overallScore, setOverallScore] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailStatusType, setEmailStatusType] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Normalize URL
  const normalizeUrl = (rawUrl) => {
    if (!rawUrl) return "";
    let val = rawUrl.trim();
    if (!/^https?:\/\//i.test(val)) {
      val = "https://" + val;
    }
    return val;
  };

  // Validate URL with custom messages
  const validateUrl = (rawUrl) => {
  if (!rawUrl || !rawUrl.trim()) return "Website URL cannot be empty.";

    const normalized = normalizeUrl(rawUrl);

    try {
      const parsed = new URL(normalized);
      const hostname = parsed.hostname;

      if (!hostname) return "Invalid website address.";

      // Reject unfinished inputs like "http://"
      if (!hostname.includes(".")) {
        return "Website must include a valid domain (e.g., example.com).";
      }

      // Block localhost/private IPs
      if (/^(localhost|127\.|192\.168\.|10\.)/.test(hostname)) {
        return "Local or private addresses are not allowed.";
      }

      // ✅ Strict hostname validation
      const hostnameRegex = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,63}(?<!-)$/;
      const labels = hostname.split(".");
      if (
        labels.some((label) => !hostnameRegex.test(label)) ||
        !/\.[A-Za-z]{2,}$/.test(hostname)
      ) {
        return "Website must be a valid domain name (letters, numbers, hyphens only).";
      }

      return null; // ✅ valid
    } catch {
      return "Please enter a valid website URL.";
    }
  };

  // Run analysis
  const handleAnalyze = async () => {
    const errMsg = validateUrl(url);
    if (errMsg) {
      setError(errMsg);
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    setUrl(normalizedUrl);

    setError("");
    setIsSubmitted(true);
    setIsLoading(true);
    setSeoData(null);
    setPageSpeed(null);
    setDesktopPerf(null);
    setMobilePerf(null);
    setOverallScore(null);
    setIsPerfLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/analyze?url=${encodeURIComponent(normalizedUrl)}`
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSeoData(data);

      Promise.all([
        fetchSeoPerformance(normalizedUrl, "desktop"),
        fetchSeoPerformance(normalizedUrl, "mobile"),
      ])
        .then(([desktop, mobile]) => {
          setDesktopPerf(desktop);
          setMobilePerf(mobile);

          setDesktopRecommendations(
            (desktop?.opportunities || []).filter((opp) => opp.savingsMs > 0)
          );
          setMobileRecommendations(
            (mobile?.opportunities || []).filter((opp) => opp.savingsMs > 0)
          );

          const overallSpeedScore =
            desktop && mobile
              ? Math.round((desktop.score + mobile.score) / 2)
              : desktop?.score || mobile?.score || 0;

          setPageSpeed(overallSpeedScore);
        })
        .catch((err) => console.error("PSI error:", err))
        .finally(() => setIsPerfLoading(false));
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch SEO data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send email with PDF
  const handleSendEmail = async () => {
    if (!seoData || !url || !email || !name) {
      let msg = "";
      if (!name) msg = "Name is missing";
      else if (!email) msg = "Email is missing";
      else if (!url) msg = "Website URL is missing";
      else msg = "SEO data not available";

      setEmailStatus(msg);
      setEmailStatusType("error");
      return;
    }

    if (overallScore == null) {
      setEmailStatus("⚠️ Overall Score is not ready yet. Please wait.");
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

      if (!res.ok) throw new Error("Failed to send email");

      setEmailStatus("SEO Audit Sent!");
      setEmailStatusType("success");

      setTimeout(() => {
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setEmailStatus("");
        setEmailStatusType("");
      }, 3000);
    } catch (err) {
      console.error("Send email error:", err);
      setEmailStatus("Failed to send email.");
      setEmailStatusType("error");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleSaveLead = async () => {
    const newLead = {
      name,
      phone,
      company,
      email,
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
    } catch (err) {
      console.error("❌ Error saving lead:", err);
    }
  };

  const handleClick = async () => {
    setIsEmailSending(true);
    await handleSendEmail();
    await handleSaveLead();
    setIsEmailSending(false);
  };

  const passFailStyle = (pass) => ({
    backgroundColor: pass ? "lightgreen" : "#ff9999",
  });

  return (
    <main>
      {activeTab !== "leads-management" && (
        <section className="main-container">
          <div className="animation-seo">
            <DotLottieReact
              src="https://lottie.host/dfd131d8-940e-49d0-b576-e4ebd9e8d280/NiKyCbXYDP.lottie"
              loop
              autoplay
              onError={(err) => console.warn("Lottie error ignored:", err)}
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

          {isLoading && (
            <div className="loader-container">
              <div className="book-wrapper">
                {/* SVG loader kept exactly as before */}
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
                  onScoreReady={setOverallScore}
                />
              )}

              {activeTab === "seo-onpage" && seoData.onpage && (
                <SeoOnPage onpage={seoData.onpage.onpage} passFailStyle={passFailStyle} />
              )}

              {activeTab === "seo-technical" && seoData.technicalSeo && (
                <SeoTechnicalDisplay
                  technicalSeo={seoData.technicalSeo.technicalSeo}
                  passFailStyle={passFailStyle}
                />
              )}

              {activeTab === "seo-content" && seoData.contentSeo && (
                <SeoContentDisplay
                  contentSeo={seoData.contentSeo.contentSeo}
                  passFailStyle={passFailStyle}
                />
              )}

              {activeTab === "seo-performance" && (
                <SeoPerformance
                  desktopData={desktopPerf}
                  mobileData={mobilePerf}
                  isPerfLoading={isPerfLoading}
                />
              )}

              {activeTab === "download-pdf" && (
                <div className="email-sent-container">
                  <div className="email-sent-card">
                    <h2>Claim Your Free SEO Audit</h2>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Enter phone (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Enter company (optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <button onClick={handleClick} disabled={isEmailSending}>
                      Get Report
                    </button>

                    {isEmailSending && (
                      <div className="loader-container email-loader">
                        <div className="loader"></div>
                        <p>Sending email, please wait...</p>
                      </div>
                    )}

                    {emailStatus && (
                      <p className={`email-status ${emailStatusType}`}>{emailStatus}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "leads-management" && <LeadsManagement />}
    </main>
  );
}

export default Main;
