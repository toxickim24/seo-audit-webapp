import React from "react";
import styles from "./GetFullReport.module.css";

function GetFullReport({ email, name, handleEmailPDF }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Confirm & Send Report</h2>
      <p className={styles.subtitle}>
        Hi <b>{name}</b>, your SEO audit results are ready.
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
        <button className={styles.primaryBtn} onClick={handleEmailPDF}>
          📧 Email My PDF Report
        </button>
      </div>
    </div>
  );
}

export default GetFullReport;
