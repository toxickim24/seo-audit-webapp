import React from "react";
import styles from "./GetFullReport.module.css";
import { generateAiSeoPDF } from "../../utils/generateAiSeoPDF";

function GetFullReport({
  email,
  name,
  aiAuditLoading,
  aiAudit,
  setJourneyStep,
  aiAuditError,
  handleAiAudit,
  url,
}) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Confirm & Send Report</h2>
      <p className={styles.subtitle}>
        Hi <b>{name}</b>, your SEO audit results are being prepared.
      </p>

      <div className={styles.reportBox}>
        <h3 className={styles.reportHeading}>📄 Report will include:</h3>
        <ul className={styles.reportList}>
          <li>Full on-page, content, technical, and performance breakdown</li>
          <li>Top 3 quick wins and priority tags</li>
          <li>Estimated speed gains with suggested fixes</li>
        </ul>
      </div>

      <div className={styles.actions}>
        {/* Step 1: Loader while generating */}
        {aiAuditLoading && (
          <div className={styles.loaderBox}>
            <div className={styles.pdfLoader}>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
            </div>
            <p className={styles.loaderText}>Generating PDF Report...</p>
          </div>
        )}

        {/* Step 2: Show Email + Dev Download when audit is ready */}
        {aiAudit && !aiAuditLoading && (
          <>
            <button
              className={styles.primaryBtn}
              onClick={() => setJourneyStep("results")}
            >
              📧 Email My PDF Report
            </button>

            {/* Dev-only PDF download button */}
            {process.env.NODE_ENV === "development" && url && (
              <button
                className={styles.primaryBtn}
                onClick={() => generateAiSeoPDF(url, aiAudit, true)}
              >
                💾 Download PDF
              </button>
            )}
          </>
        )}

        {/* Step 3: Error fallback */}
        {aiAuditError && !aiAuditLoading && !aiAudit && (
          <div className={styles.errorBox}>
            <p className={styles.errorText}>❌ {aiAuditError}</p>
            <button className={styles.primaryBtn} onClick={handleAiAudit}>
              🔄 Retry Generating Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetFullReport;