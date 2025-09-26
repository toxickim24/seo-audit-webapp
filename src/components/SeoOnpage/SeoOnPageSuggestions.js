// SeoOnPageSuggestions.js
import React from "react";
import styles from "./SeoOnPage.module.css"; // scoped styles

// Build {text, level} instead of just strings so we can style by impact
const generateSeoSuggestions = (onpage = {}, contentSeo) => {
  const out = [];

  const push = (text, level = "low") => out.push({ text, level });

  if (!onpage.titlePass) push("Title is missing or too long. Keep it under 60 characters and descriptive.", "high");
  if (!onpage.metaPass)  push("Meta description is missing or too long. Keep it under 160 characters.", "high");

  if (!onpage.h1Pass) push("There should be exactly 1 H1 heading on the page.", "medium");
  if (!onpage.h2Pass) push("Use at least one H2 heading for better structure.", "low");
  if (!onpage.h3Pass) push("Add more H3 headings if necessary to structure subsections.", "low");
  if (!onpage.h4Pass) push("Add more H4 headings if necessary to structure subsections.", "low");
  if (!onpage.h5Pass) push("Add more H5 headings if necessary to structure subsections.", "low");
  if (!onpage.h6Pass) push("Add more H6 headings if necessary to structure subsections.", "low");

  if (onpage.imageCount === 0)         push("No images found on the page. Consider adding relevant images.", "medium");
  if (onpage.imagesWithoutAlt > 0)     push(`${onpage.imagesWithoutAlt} image(s) are missing alt attributes. Add descriptive alt text.`, "high");

  if (!onpage.internalLinksPass) push("Add internal links to connect related pages.", "low");
  if (!onpage.externalLinksPass) push("Add external links to authoritative sources.", "low");
  if (!onpage.brokenLinksPass)   push("Fix broken links to improve user experience and SEO.", "high");

  if (!onpage.socialPass)      push("Add Open Graph and Twitter Card meta tags for better social sharing.", "low");
  if (!onpage.structuredPass)  push("Add JSON-LD structured data to help search engines understand your content.", "medium");
  if (!onpage.bodyPass)        push("Increase the amount of visible content on the page to at least 500 characters.", "medium");

  if (contentSeo && !contentSeo.contentSeo?.keywordInHeadings)
    push("Include target keywords in headings for better SEO.", "low");

  if (contentSeo && contentSeo.contentSeo?.keywordDensity < 1)
    push("Improve keyword density in body content.", "medium");

  if (contentSeo && (contentSeo.contentSeo?.mediaCount ?? 0) < 1)
    push("Add more media (images/videos) to enrich content.", "low");

  return out;
};

const SeoSuggestions = ({ onpage, contentSeo, className = "" }) => {
  const suggestions = generateSeoSuggestions(onpage, contentSeo);
  if (!suggestions.length) return null;

  return (
    <>
      <h3 className={styles.title}>On-Page SEO Suggestions</h3>
      <ul className={styles.list}>
        {suggestions.map(({ text, level }, i) => (
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
    </>
  );
};

export default SeoSuggestions;
