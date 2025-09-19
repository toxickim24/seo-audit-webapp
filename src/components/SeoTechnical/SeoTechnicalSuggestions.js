function SeoTechnicalSuggestions({ technicalSeo }) {
  if (!technicalSeo) return null;

  const recs = [];

  // Canonical
  if (!technicalSeo.canonical) {
    recs.push("Add a canonical tag to specify your preferred page version.");
  }
  if (technicalSeo.canonicalConflict) {
    recs.push("Avoid multiple canonical tags. Keep only one to prevent conflicts.");
  }

  // Robots Meta
  if (!technicalSeo.hasRobotsMeta) {
    recs.push("Add a robots meta tag to control indexing and crawling.");
  }
  if (technicalSeo.robotsIndex === "Failed") {
    recs.push("Remove 'noindex' if you want this page to appear in search results.");
  }
  if (technicalSeo.robotsFollow === "Failed") {
    recs.push("Remove 'nofollow' if you want search engines to follow links on this page.");
  }

  // Viewport
  if (!technicalSeo.hasViewport) {
    recs.push("Add a viewport meta tag to improve mobile responsiveness.");
  }

  // HTTPS
  if (!technicalSeo.https) {
    recs.push("Switch your site to HTTPS for better security and SEO.");
  }

  // Favicon
  if (!technicalSeo.hasFavIcon) {
    recs.push("Add a favicon to make your website easily recognizable in browsers.");
  }

  // Language / hreflang
  if (!technicalSeo.hreflang) {
    recs.push("Add Language tags to specify language and region targeting.");
  }

  // Mixed content
  if (technicalSeo.mixedContent) {
    recs.push("Fix mixed content issues by using HTTPS for all images, scripts, and styles.");
  }

  // Trailing Slash
  if (!technicalSeo.trailingSlash) {
    recs.push("Keep consistent URL structure (decide on using trailing slash or not).");
  }

  // Page size
  if (!technicalSeo.pageSizeKB || technicalSeo.pageSizeKB >= 2048) {
    recs.push("Reduce page size below 2MB by optimizing images and scripts.");
  }

  // Number of requests
  if (!technicalSeo.numRequests || technicalSeo.numRequests >= 100) {
    recs.push("Reduce the number of requests (minify CSS/JS, combine files, lazy-load images).");
  }

  // AMP
  if (!technicalSeo.hasAMP) {
    recs.push("Consider using AMP (Accelerated Mobile Pages) for faster mobile performance.");
  }

  // Sitemap
  if (!technicalSeo.sitemapUrl) {
    recs.push("Add a sitemap.xml file to help search engines discover your pages.");
  }

  // Robots.txt
  if (!technicalSeo.robotsTxtUrl) {
    recs.push("Add a robots.txt file to guide search engines on what to crawl.");
  }

  return (
    <div className="seo-suggestions">
      <h3>Technical SEO Recommendations</h3>
      {recs.length > 0 ? (
        <ul>
          {recs.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : (
        <p>Your technical SEO looks good! No major issues found.</p>
      )}
    </div>
  );
}

export default SeoTechnicalSuggestions;