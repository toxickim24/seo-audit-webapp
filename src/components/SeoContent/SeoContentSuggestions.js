function SeoContentSuggestions({ contentSeo }) {
  if (!contentSeo) return null;

  const recs = [];

  // Title
  if (contentSeo.titleLength < 50 || contentSeo.titleLength > 60) {
    recs.push("Make your title between 50–60 characters for better search results display.");
  }
  if (!contentSeo.hasKeywordInTitle) {
    recs.push("Include your main keyword in the title to improve relevance.");
  }

  // Meta
  if (contentSeo.metaDescLength < 120 || contentSeo.metaDescLength > 160) {
    recs.push("Write a meta description between 120–160 characters.");
  }
  if (!contentSeo.hasKeywordInMeta) {
    recs.push("Add your keyword in the meta description for better visibility.");
  }

  // Keyword usage
  if (parseFloat(contentSeo.keywordDensity) <= 0 || parseFloat(contentSeo.keywordDensity) >= 5) {
    recs.push("Keep keyword density around 1–3%. Avoid stuffing.");
  }
  if (!contentSeo.keywordInHeadings) {
    recs.push("Use your main keyword at least once in headings (H1, H2, etc.).");
  }
  if (!contentSeo.keywordInFirstParagraph) {
    recs.push("Add your keyword in the first paragraph so search engines catch it early.");
  }

  // Word Count / Body
  if (contentSeo.wordCount < 300) {
    recs.push("Increase word count. Aim for at least 300+ words for stronger SEO.");
  }
  if (contentSeo.bodyLength < 500) {
    recs.push("Add more detailed content for better context and ranking chances.");
  }

  // Readability
  if (contentSeo.avgSentenceLength > 20) {
    recs.push("Shorten sentences. Keep average sentence length under 20 words for easier reading.");
  }

  // Images
  if (contentSeo.totalImages > 0 && contentSeo.imagesWithAlt < contentSeo.totalImages) {
    recs.push("Add ALT text to all images so search engines understand them.");
  }
  if (contentSeo.totalImages === 0) {
    recs.push("Add at least one relevant image to make content engaging.");
  }

  // Links
  if (contentSeo.internalLinks === 0) {
    recs.push("Add internal links to connect your content with other pages.");
  }
  if (contentSeo.externalLinks === 0) {
    recs.push("Add at least one external link to a trusted source.");
  }

  return (
    <div className="seo-suggestions">
      <h3>Content SEO Recommendations</h3>
      <ul>
        {recs.length > 0 ? (
          recs.map((r, i) => <li key={i}>{r}</li>)
        ) : (
          <p>Your content looks well-optimized!</p>
        )}
      </ul>
    </div>
  );
}

export default SeoContentSuggestions;