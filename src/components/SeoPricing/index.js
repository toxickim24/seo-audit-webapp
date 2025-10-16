import React from "react";
import styles from "./SeoPricing.module.css";

function SeoPricing() {
  return (
    <div className="main-container">
      <h1 className="title">💰 Pricing Plans</h1>
      <p className="subtitle">
        Credits are used for running SEO scans. Pick the plan that fits your needs.
      </p>

      <div className={styles.pricingGrid}>
        {/* Starter Plan */}
        <div className={`${styles.card} ${styles.starter}`}>
          <h2 className={styles.planTitle}>Starter</h2>
          <p className={styles.price}>
            Free<span> /month</span>
          </p>
          <ul className={styles.features}>
            <li>✔ 3 Credits / email</li>
            <li>✔ Basic SEO Audit</li>
            <li>✔ Chrome Extension Access</li>
            <li>✔ Email Support</li>
          </ul>
          <button className={styles.btnOutline}>Start Free</button>
        </div>

        {/* Professional Plan */}
        <div className={`${styles.card} ${styles.professional} ${styles.featured}`}>
          <div className={styles.badge}>Most Popular</div>
          <h2 className={styles.planTitle}>Professional</h2>
          <p className={styles.price}>
            $49<span> /month</span>
          </p>
          <ul className={styles.features}>
            <li>✔ 100 Credits / month</li>
            <li>✔ Advanced SEO Audit</li>
            <li>✔ Chrome Extension + Widget</li>
            <li>✔ Priority Support</li>
          </ul>
          <button className={styles.btnPrimary}>Choose Professional</button>
        </div>

        {/* Business Plan */}
        <div className={`${styles.card} ${styles.business}`}>
          <h2 className={styles.planTitle}>Business</h2>
          <p className={styles.price}>
            $149<span> /month</span>
          </p>
          <ul className={styles.features}>
            <li>✔ 500 Credits / month</li>
            <li>✔ Unlimited SEO Audits</li>
            <li>✔ Dedicated Account Manager</li>
            <li>✔ 24/7 Premium Support</li>
          </ul>
          <button className={styles.btnOutline}>Contact Sales</button>
        </div>
      </div>
    </div>
  );
}

export default SeoPricing;