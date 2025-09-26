import React, { useState } from "react";
import styles from "./SeoTools.module.css";

function SeoTools() {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<script>
  (function() {
    var seoMojo = document.createElement('script');
    seoMojo.src = 'http://localhost:3001/embeddable-widget/widget.js';
    seoMojo.async = true;
    document.head.appendChild(seoMojo);
    
    seoMojo.onload = function() {
      if (window.SEOMojoWidget) {
        window.SEOMojoWidget.init({
          containerId: 'seo-mojo-widget',
          theme: 'light',
          position: 'bottom-right'
        });
      }
    };
  })();
</script>

<div id="seo-mojo-widget"></div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🔗 SEO Mojo Tools</h1>
      <p className={styles.subtitle}>
        Download our browser extension or embed the SEO Mojo widget into your site.
      </p>

      {/* ---------- Features Section ---------- */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <span className={styles.icon}>⚡</span>
          <h3>Fast Loading</h3>
          <p>Lightweight and optimized for speed.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>🎨</span>
          <h3>Customizable</h3>
          <p>Match your website’s design.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>📱</span>
          <h3>Mobile Friendly</h3>
          <p>Responsive design for all devices.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>🔒</span>
          <h3>Secure</h3>
          <p>HTTPS enabled and privacy focused.</p>
        </div>
      </div>

      {/* ---------- Extension Section ---------- */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Chrome Extension</h2>
        <div className={styles.sectionContent}>
          <div className={styles.extensionImage}>
            <img
              src="/seo-extension.png"
              alt="SEO Mojo Extension Preview"
              className={styles.image}
            />
          </div>
          <div className={styles.instructions}>
            <h3>Installation Instructions:</h3>
            <ol>
              <li>Click the <b>Download Extension</b> button.</li>
              <li>Open your browser’s <b>Extensions</b> or <b>Add-ons</b> page.</li>
              <li>Drag and drop the downloaded file into the page.</li>
              <li>Confirm the installation when prompted.</li>
              <li>Pin the SEO Mojo extension to your browser toolbar for quick access.</li>
            </ol>
            <button className={styles.primaryBtn}>⬇ Download Extension</button>
          </div>
        </div>
      </section>

      {/* ---------- Widget Section ---------- */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Embeddable Widget</h2>
        <div className={styles.sectionContent}>
          <div className={styles.codeWrapper}>
            <pre className={styles.codeBlock}>
              <code>{widgetCode}</code>
            </pre>
          </div>
          <div className={styles.instructions}>
            <h3>Installation Instructions:</h3>
            <ol>
              <li>Open your website’s HTML file or template in an editor.</li>
              <li>Find the closing <code>&lt;/body&gt;</code> tag.</li>
              <li>Paste the embed code just before that tag.</li>
              <li>Save your changes and upload the file if your site is hosted on a server.</li>
              <li>Reload your website to confirm the widget is working.</li>
            </ol>

            <button
              onClick={handleCopy}
              className={`${styles.secondaryBtn} ${copied ? styles.copied : ""}`}
            >
              {copied ? "✅ Copied!" : "📋 Copy Code"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SeoTools;