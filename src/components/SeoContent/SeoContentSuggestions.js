// src/components/SeoContent/SeoContentSuggestions.js
import React from "react";
import styles from "./SeoContent.module.css"; // scoped styles

// Build { text, level } items so we can style by severity
const buildRecs = (c = {}) => {
  const recs = [];
  const push = (text, level = "low") => recs.push({ text, level });

  // Title
  if (c.titleLength < 50 || c.titleLength > 60) {
    push("Make your title between 50–60 characters for better search results display.", "medium");
  }
  if (!c.hasKeywordInTitle) {
    push("Include your main keyword in the title to improve relevance.", "high");
  }

  // Meta description
  if (c.metaDescLength < 120 || c.metaDescLength > 160) {
    push("Write a meta description between 120–160 characters.", "medium");
  }
  if (!c.hasKeywordInMeta) {
    push("Add your keyword in the meta description for better visibility.", "medium");
  }

  // Keyword usage
  const kd = parseFloat(c.keywordDensity);
  if (Number.isFinite(kd)) {
    if (kd <= 0 || kd >= 5) {
      push("Keep keyword density around 1–3%. Avoid stuffing.", "high");
    } else if (kd < 1 || kd > 3) {
      push("Tune keyword density toward 1–3% for best balance.", "medium");
    }
  } else {
    push("Set a clear primary keyword and use it naturally.", "medium");
  }

  if (!c.keywordInHeadings) {
    push("Use your main keyword at least once in headings (H1, H2, etc.).", "medium");
  }
  if (!c.keywordInFirstParagraph) {
    push("Add your keyword in the first paragraph so search engines catch it early.", "medium");
  }

  // Word Count / Body
  if (c.wordCount < 300) {
    push("Increase word count. Aim for at least 300+ words for stronger SEO.", "medium");
  }
  if (c.bodyLength < 500) {
    push("Add more detailed content for better context and ranking chances.", "medium");
  }

  // Readability
  if (c.avgSentenceLength > 20) {
    push("Shorten sentences. Keep average sentence length under 20 words for easier reading.", "low");
  }

  // Images
  if (c.totalImages === 0) {
    push("Add at least one relevant image to make content engaging.", "medium");
  } else if (c.totalImages > 0 && c.imagesWithAlt < c.totalImages) {
    const allMissing = c.imagesWithAlt === 0;
    push(
      allMissing
        ? "All images are missing ALT text—add descriptive ALT text to every image."
        : "Add ALT text to all images so search engines understand them.",
      allMissing ? "high" : "medium"
    );
  }

  // Links
  if (c.internalLinks === 0) {
    push("Add internal links to connect your content with other pages.", "medium");
  }
  if (c.externalLinks === 0) {
    push("Add at least one external link to a trusted source.", "low");
  }

  return recs;
};

const SeoContentSuggestions = ({ contentSeo, className = "" }) => {
  if (!contentSeo) return null;

  const recs = buildRecs(contentSeo);

  return (
    <>
      <h3 className={styles.title}>Content SEO Recommendations</h3>

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
        <p className={styles.ok}>Your content looks well-optimized!</p>
      )}
    </>
  );
};

export default SeoContentSuggestions;
