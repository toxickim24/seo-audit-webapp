// src/components/SeoTechnical/SeoTechnicalSuggestions.js
import React from "react";
import styles from "./SeoTechnical.module.css"; // scoped styles

// Build {text, level} items so we can style by impact
const buildRecs = (t = {}) => {
  const recs = [];
  const push = (text, level = "low") => recs.push({ text, level });

  // Canonical
  if (!t.canonical) push("Add a canonical tag to specify your preferred page version.", "high");
  if (t.canonicalConflict) push("Avoid multiple canonical tags. Keep only one to prevent conflicts.", "high");

  // Robots Meta
  if (!t.hasRobotsMeta) push("Add a robots meta tag to control indexing and crawling.", "high");
  if (t.robotsIndex === "Failed") push("Remove 'noindex' if you want this page to appear in search results.", "high");
  if (t.robotsFollow === "Failed") push("Remove 'nofollow' if you want search engines to follow links on this page.", "medium");

  // Viewport
  if (!t.hasViewport) push("Add a viewport meta tag to improve mobile responsiveness.", "medium");

  // HTTPS
  if (!t.https) push("Switch your site to HTTPS for better security and SEO.", "high");

  // Favicon
  if (!t.hasFavIcon) push("Add a favicon to make your website easily recognizable in browsers.", "low");

  // Language / hreflang
  if (!t.hreflang) push("Add language (hreflang) tags to specify language/region targeting.", "medium");

  // Mixed content
  if (t.mixedContent) push("Fix mixed content by serving all images, scripts, and styles over HTTPS.", "high");

  // Trailing slash consistency
  if (!t.trailingSlash) push("Keep a consistent URL structure (decide on trailing slash or not).", "low");

  // Page size
  if (!t.pageSizeKB || t.pageSizeKB >= 4096) {
    push("Reduce page size below 4MB by optimizing images and scripts.", "high");
  } else if (t.pageSizeKB >= 2048) {
    push("Reduce page size below 2MB for faster loads.", "medium");
  }

  // Number of requests
  if (!t.numRequests || t.numRequests >= 150) {
    push("Reduce the number of requests (minify/concat CSS & JS, lazy-load media).", "high");
  } else if (t.numRequests >= 100) {
    push("Trim request count (defer non-critical scripts, inline critical CSS).", "medium");
  }

  // AMP (optional)
  if (!t.hasAMP) push("Consider AMP (Accelerated Mobile Pages) for faster mobile performance.", "low");

  // Sitemap
  if (!t.sitemapUrl) push("Add a sitemap.xml to help search engines discover your pages.", "medium");

  // Robots.txt
  if (!t.robotsTxtUrl) push("Add a robots.txt file to guide what crawlers can access.", "medium");

  return recs;
};

const SeoTechnicalSuggestions = ({ technicalSeo, className = "" }) => {
  if (!technicalSeo) return null;

  const recs = buildRecs(technicalSeo);

  return (
    <>
      <h3 className={styles.title}>Technical SEO Recommendations</h3>

      {recs.length > 0 ? (
        <ul className={styles.list}>
          {recs.map(({ text, level }, i) => (
            <li key={i} className={styles.item}>
              <div className={styles.left}>
                <span className={`${styles.dot} ${styles[level]}`} />
                <span className={styles.text}>{text}</span>
              </div>
              <span className={`${styles.badge} ${styles[level]}`}>
                {level === "high" ? "High" : level === "medium" ? "Medium" : "Low"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.ok}>Your technical SEO looks good! No major issues found.</p>
      )}
    </>
  );
};

export default SeoTechnicalSuggestions;
export { buildRecs as buildTechnicalRecs };