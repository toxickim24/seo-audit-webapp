// seoRecommendations.js

// Performance SEO
export function getPerformanceRecommendations(opportunities = []) {
  if (!opportunities || opportunities.length === 0) return [];

  return opportunities
    .filter((opp) => opp.savingsMs > 0)
    .map((opp) => {
      const seconds = opp.savingsMs / 1000;
      let impact =
        opp.savingsMs > 1000
          ? "High impact ⚡"
          : opp.savingsMs > 200
          ? "Medium impact 👍"
          : "Low impact ✅";
      return `${opp.title} — ${impact} (about ${seconds.toFixed(1)}s faster)`;
    });
}

// SEO On-Page
export function getFullOnpageRecommendations(onpage) {
  if (!onpage) return [];
  const recs = [];
  const h1Count = onpage.headingCount?.h1 || 0;
  if (h1Count !== 1) recs.push("There should be exactly 1 H1 heading on the page.");
  const h6Count = onpage.headingCount?.h6 || 0;
  if (h6Count < 1) recs.push("Add more H6 headings if necessary to structure subsections.");
  if (!onpage.keywordInHeadings) recs.push("Include target keywords in headings for better SEO.");
  const missingAlt = onpage.imagesWithoutAlt || 0;
  if (missingAlt > 0) recs.push(`${missingAlt} image(s) are missing alt attributes. Add descriptive alt text.`);
  if (!onpage.brokenLinksPass) recs.push("Fix broken links to improve user experience and SEO.");
  if (!onpage.titlePass) recs.push("Optimize the title for better SEO.");
  if (!onpage.metaPass) recs.push("Optimize the meta description for SEO.");
  if (!onpage.ogTitle) recs.push("Add Open Graph title for better social media sharing.");
  if (!onpage.ogDescription) recs.push("Add Open Graph description for social previews.");
  if (!onpage.twitterCard) recs.push("Include Twitter Card metadata for social sharing.");
  if (!onpage.structuredPass) recs.push("Add or fix structured data (JSON-LD) for rich results.");
  return recs;
}

// Technical SEO
export function getTechnicalSeoRecommendations(technicalSeo) {
  if (!technicalSeo) return [];
  const recs = [];
  if (!technicalSeo.canonical) recs.push("Add a canonical tag to specify your preferred page version.");
  if (technicalSeo.canonicalConflict) recs.push("Avoid multiple canonical tags. Keep only one to prevent conflicts.");
  if (!technicalSeo.hasRobotsMeta) recs.push("Add a robots meta tag to control indexing and crawling.");
  if (technicalSeo.robotsIndex === "Failed") recs.push("Remove 'noindex' if you want this page to appear in search results.");
  if (technicalSeo.robotsFollow === "Failed") recs.push("Remove 'nofollow' if you want search engines to follow links on this page.");
  if (!technicalSeo.hasViewport) recs.push("Add a viewport meta tag to improve mobile responsiveness.");
  if (!technicalSeo.https) recs.push("Switch your site to HTTPS for better security and SEO.");
  if (!technicalSeo.hasFavIcon) recs.push("Add a favicon to make your website easily recognizable in browsers.");
  if (!technicalSeo.hreflang) recs.push("Add Language tags to specify language and region targeting.");
  if (technicalSeo.mixedContent) recs.push("Fix mixed content issues by using HTTPS for all images, scripts, and styles.");
  if (!technicalSeo.trailingSlash) recs.push("Keep consistent URL structure (decide on using trailing slash or not).");
  if (!technicalSeo.pageSizeKB || technicalSeo.pageSizeKB >= 2048) recs.push("Reduce page size below 2MB by optimizing images and scripts.");
  if (!technicalSeo.numRequests || technicalSeo.numRequests >= 100) recs.push("Reduce the number of requests (minify CSS/JS, combine files, lazy-load images).");
  if (!technicalSeo.hasAMP) recs.push("Consider using AMP (Accelerated Mobile Pages) for faster mobile performance.");
  if (!technicalSeo.sitemapUrl) recs.push("Add a sitemap.xml file to help search engines discover your pages.");
  if (!technicalSeo.robotsTxtUrl) recs.push("Add a robots.txt file to guide search engines on what to crawl.");
  return recs;
}

// SEO Content
export function getSeoContentRecommendations(contentSeo) {
  if (!contentSeo) return [];
  const recs = [];
  if (contentSeo.titleLength < 50 || contentSeo.titleLength > 60) recs.push("Make your title between 50–60 characters for better search results display.");
  if (!contentSeo.hasKeywordInTitle) recs.push("Include your main keyword in the title to improve relevance.");
  if (contentSeo.metaDescLength < 120 || contentSeo.metaDescLength > 160) recs.push("Write a meta description between 120–160 characters.");
  if (!contentSeo.hasKeywordInMeta) recs.push("Add your keyword in the meta description for better visibility.");
  if (parseFloat(contentSeo.keywordDensity) <= 0 || parseFloat(contentSeo.keywordDensity) >= 5) recs.push("Keep keyword density around 1–3%. Avoid stuffing.");
  if (!contentSeo.keywordInHeadings) recs.push("Use your main keyword at least once in headings (H1, H2, etc.).");
  if (!contentSeo.keywordInFirstParagraph) recs.push("Add your keyword in the first paragraph so search engines catch it early.");
  if (contentSeo.wordCount < 300) recs.push("Increase word count. Aim for at least 300+ words for stronger SEO.");
  if (contentSeo.bodyLength < 500) recs.push("Add more detailed content for better context and ranking chances.");
  if (contentSeo.avgSentenceLength > 20) recs.push("Shorten sentences. Keep average sentence length under 20 words for easier reading.");
  if (contentSeo.totalImages > 0 && contentSeo.imagesWithAlt < contentSeo.totalImages) recs.push("Add ALT text to all images so search engines understand them.");
  if (contentSeo.totalImages === 0) recs.push("Add at least one relevant image to make content engaging.");
  if (contentSeo.internalLinks === 0) recs.push("Add internal links to connect your content with other pages.");
  if (contentSeo.externalLinks === 0) recs.push("Add at least one external link to a trusted source.");
  return recs;
}