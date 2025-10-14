import axios from "axios";
import * as cheerio from "cheerio";

export async function analyzeContentSeo(url, keyword = "seo") {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const wordCount = bodyText.split(" ").length;
    const keywordDensity =
      (bodyText.match(new RegExp(keyword, "gi")) || []).length /
      (wordCount || 1);

    const headingsText = $("h1, h2, h3").text();
    const keywordInHeadings = headingsText
      .toLowerCase()
      .includes(keyword.toLowerCase());

    const mediaCount = $("img, video").length;

    // 🔹 Extra Checks
    const title = $("title").text().trim();
    const titleLength = title.length;
    const hasKeywordInTitle = title.toLowerCase().includes(keyword.toLowerCase());

    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const metaDescLength = metaDescription.length;
    const hasKeywordInMeta = metaDescription
      .toLowerCase()
      .includes(keyword.toLowerCase());

    const images = $("img");
    const totalImages = images.length;
    const imagesWithAlt = images.filter((i, el) => $(el).attr("alt")).length;

    const hostname = new URL(url).hostname;
    const internalLinks = $(`a[href^="/"], a[href*="${hostname}"]`).length;
    const externalLinks = $(`a[href^="http"]`).not(`[href*="${hostname}"]`).length;

    const sentences = bodyText.split(/[.!?]/).filter(Boolean);
    const avgSentenceLength = sentences.length
      ? Math.round(wordCount / sentences.length)
      : 0;

    const firstParagraph = $("p").first().text().toLowerCase();
    const keywordInFirstParagraph = firstParagraph.includes(keyword.toLowerCase());

    // 🔹 Scoring system
    let score = 0;
    const maxScore = 100;

    if (wordCount >= 300) score += 10;
    if (keywordDensity > 0 && keywordDensity < 0.05) score += 10;
    if (bodyText.length > 500) score += 10;
    if (keywordInHeadings) score += 10;
    if (mediaCount > 0) score += 5;

    if (titleLength >= 50 && titleLength <= 60) score += 10;
    if (hasKeywordInTitle) score += 10;

    if (metaDescLength >= 120 && metaDescLength <= 160) score += 10;
    if (hasKeywordInMeta) score += 5;

    if (imagesWithAlt === totalImages && totalImages > 0) score += 5;

    if (internalLinks > 0) score += 5;
    if (externalLinks > 0) score += 5;

    if (avgSentenceLength <= 20) score += 3;
    if (keywordInFirstParagraph) score += 2;

    return {
      overview: { score, maxScore },
      contentSeo: {
        wordCount,
        keywordDensity: (keywordDensity * 100).toFixed(2) + "%",
        bodyLength: bodyText.length,
        keywordInHeadings,
        mediaCount,
        title,
        titleLength,
        hasKeywordInTitle,
        metaDescription,
        metaDescLength,
        hasKeywordInMeta,
        totalImages,
        imagesWithAlt,
        internalLinks,
        externalLinks,
        avgSentenceLength,
        keywordInFirstParagraph,
      },
    };
  } catch (err) {
    console.error("Content SEO error:", err.message);
    throw err;
  }
}
