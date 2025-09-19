// SeoSuggestions.js
import React from "react";
import "../../css/Main.css"; // reuse existing styles

// Helper function
const generateSeoSuggestions = (onpage, contentSeo) => {
  const suggestions = [];

  if (!onpage.titlePass) {
    suggestions.push("Title is missing or too long. Keep it under 60 characters and descriptive.");
  }

  if (!onpage.metaPass) {
    suggestions.push("Meta description is missing or too long. Keep it under 160 characters.");
  }

  if (!onpage.h1Pass) suggestions.push("There should be exactly 1 H1 heading on the page.");
  if (!onpage.h2Pass) suggestions.push("Use at least one H2 heading for better structure.");
  if (!onpage.h3Pass) suggestions.push("Add more H3 headings if necessary to structure subsections.");
  if (!onpage.h4Pass) suggestions.push("Add more H4 headings if necessary to structure subsections.");
  if (!onpage.h5Pass) suggestions.push("Add more H5 headings if necessary to structure subsections.");
  if (!onpage.h6Pass) suggestions.push("Add more H6 headings if necessary to structure subsections.");

  if (onpage.imageCount === 0) suggestions.push("No images found on the page. Consider adding relevant images.");
  if (onpage.imagesWithoutAlt > 0) suggestions.push(`${onpage.imagesWithoutAlt} image(s) are missing alt attributes. Add descriptive alt text.`);

  if (!onpage.internalLinksPass) suggestions.push("Add internal links to connect related pages.");
  if (!onpage.externalLinksPass) suggestions.push("Add external links to authoritative sources.");
  if (!onpage.brokenLinksPass) suggestions.push("Fix broken links to improve user experience and SEO.");

  if (!onpage.socialPass) suggestions.push("Add Open Graph and Twitter Card meta tags for better social sharing.");
  if (!onpage.structuredPass) suggestions.push("Add JSON-LD structured data to help search engines understand your content.");
  if (!onpage.bodyPass) suggestions.push("Increase the amount of visible content on the page to at least 500 characters.");

  if (contentSeo && !contentSeo.contentSeo.keywordInHeadings) {
    suggestions.push("Include target keywords in headings for better SEO.");
  }

  if (contentSeo && contentSeo.contentSeo.keywordDensity < 1) {
    suggestions.push("Improve keyword density in body content.");
  }

  if (contentSeo && contentSeo.contentSeo.mediaCount < 1) {
    suggestions.push("Add more media (images/videos) to enrich content.");
  }

  return suggestions;
};

// Component
const SeoSuggestions = ({ onpage, contentSeo }) => {
  const suggestions = generateSeoSuggestions(onpage, contentSeo);

  if (!suggestions.length) return null; // Nothing to show

  return (
    <div className="seo-suggestions">
      <h3>SEO Onpage Suggestion</h3>
      <ul>
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
};

export default SeoSuggestions;
