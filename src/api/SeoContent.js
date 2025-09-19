import axios from "axios";
import * as cheerio from "cheerio";

export async function analyzeContentSeo(url, keyword = "seo") {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const wordCount = bodyText.split(" ").length;
    const keywordDensity = (bodyText.match(new RegExp(keyword, "gi")) || []).length / (wordCount || 1);
    const headingsText = $("h1, h2, h3").text();
    const keywordInHeadings = headingsText.toLowerCase().includes(keyword.toLowerCase());
    const mediaCount = $("img, video").length;

    let score = 0;
    const maxScore = 100;
    if (wordCount >= 300) score += 30;
    if (keywordDensity > 0 && keywordDensity < 0.05) score += 20;
    if (bodyText.length > 500) score += 20;
    if (keywordInHeadings) score += 15;
    if (mediaCount > 0) score += 15;

    return {
      overview: { score, maxScore },
      contentSeo: { wordCount, keywordDensity: (keywordDensity * 100).toFixed(2) + "%", bodyLength: bodyText.length, keywordInHeadings, mediaCount }
    };
  } catch (err) {
    console.error("Content SEO error:", err.message);
    throw err;
  }
}
