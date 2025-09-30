import React from "react";
import styles from "./GetFullReport.module.css";

function GetFullReport({
  email,
  name,
  handleEmailPDF,
  isEmailSending,
  emailStatus,
  emailStatusType,
  onScanAnother,
  onViewResults,
}) {
  return (
    <div className={styles.container}>
      {/* Title */}
      <h2 className={styles.title}>Confirm & Send Report</h2>
      <p className={styles.subtitle}>
        Hi <b>{name}</b>, your SEO audit for email: <b>{email}</b> is ready.
      </p>

      {/* Report details */}
      <div className={styles.reportBox}>
        <h3 className={styles.reportHeading}>📄 Report will include:</h3>
        <ul className={styles.reportList}>
          <li>Full on-page, content, technical, and performance breakdown</li>
          <li>Top 3 quick wins and priority tags</li>
          <li>Estimated speed gains with suggested fixes</li>
        </ul>
      </div>

      {/* Loader for email sending */}
      {isEmailSending && (
        <div className="loader-container email-loader">
          <div className="loader"></div>
          <p>Sending email, please wait...</p>
        </div>
      )}

      {/* Email success state */}
      {emailStatusType === "success" ? (
        <div className={styles.successBox}>
          <div className={styles.checkmark}>✓</div>
          <p>
            ✅ Report Sent! <br />
            Your full PDF report is on its way to <b>{email}</b>. <br />
            Check your inbox (and spam folder) in a moment.
          </p>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} onClick={onScanAnother}>
              🔄 Scan Another URL
            </button>
            <button className={styles.primaryBtn} onClick={onViewResults}>
              📊 View Quick Results
            </button>
          </div>
        </div>
      ) : (
        !isEmailSending && (
          <div className={styles.actions}>
            <button className={styles.primaryBtn} onClick={handleEmailPDF}>
              📧 Email My PDF Report
            </button>
          </div>
        )
      )}

      {/* Error state */}
      {emailStatusType === "error" && (
        <p className={styles.error}>{emailStatus}</p>
      )}
    </div>
  );
}

export default GetFullReport;
