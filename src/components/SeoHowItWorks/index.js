import React from "react";
import styles from "./SeoHowItWorks.module.css";

function SeoHowItWorks() {
  return (
    <div className="main-container">
      <h1 className="title">⚙️ How SEO Mojo Works</h1>
      <p className="subtitle">
        Understand the simple steps behind how we analyze and optimize your website’s SEO performance.
      </p>

      {/* ---------- Steps Grid ---------- */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <span className={styles.icon}>🔍</span>
          <h3>Step 1: Enter Your Website</h3>
          <p>
            Type your website URL into the audit tool. We’ll automatically detect your site’s structure and prepare for scanning.
          </p>
        </div>

        <div className={styles.featureCard}>
          <span className={styles.icon}>📊</span>
          <h3>Step 2: Run SEO Analysis</h3>
          <p>
            Our system performs a complete SEO check — including on-page, content, technical, and performance analysis.
          </p>
        </div>

        <div className={styles.featureCard}>
          <span className={styles.icon}>🧠</span>
          <h3>Step 3: AI Insights</h3>
          <p>
            We use AI to summarize your results and highlight improvement opportunities in plain English.
          </p>
        </div>

        <div className={styles.featureCard}>
          <span className={styles.icon}>📩</span>
          <h3>Step 4: Get Your Report</h3>
          <p>
            Receive a professional, branded PDF report directly in your inbox — ready to share or present to clients.
          </p>
        </div>
      </div>

      {/* ---------- CTA Section ---------- */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Start Your SEO Audit Today</h2>
        <p className={styles.subtitle}>
          Enter your site URL on the home page and see where your website stands — it’s free and only takes a minute!
        </p>
        <a href="/" className={styles.primaryBtn}>🚀 Run an SEO Audit</a>
      </section>
    </div>
  );
}

export default SeoHowItWorks;