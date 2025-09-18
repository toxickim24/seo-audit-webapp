import axios from "axios";
import * as cheerio from "cheerio";

export async function analyzeOnPage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.status >= 400) {
      throw new Error(`Upstream returned status: ${response.status}`);
    }

    const $ = cheerio.load(response.data);

    // On-page elements
    const title = $("title").text().trim() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1").map((i, el) => $(el).text().trim()).get();
    const h2 = $("h2").map((i, el) => $(el).text().trim()).get();
    const h3 = $("h3").map((i, el) => $(el).text().trim()).get();

    const images = $("img");
    let withAlt = 0;
    images.each((i, img) => {
      if ($(img).attr("alt") && $(img).attr("alt").trim() !== "") withAlt++;
    });

    const internalLinks = $("a[href]").filter((i, el) => {
      const href = $(el).attr("href");
      try {
        return (
          href &&
          (href.startsWith("/") || new URL(href, url).hostname === new URL(url).hostname)
        );
      } catch {
        return false;
      }
    }).length;

    const canonical = $('link[rel="canonical"]').attr("href") || "";

    // Scoring
    let score = 0;
    const maxScore = 100;
    if (title && title.length <= 60) score += 15;
    if (metaDescription && metaDescription.length <= 160) score += 15;
    if (h1.length > 0) score += 10;
    if (h2.length > 0) score += 10;
    if (images.length > 0 && withAlt === images.length) score += 10;
    if (internalLinks > 0) score += 10;
    if ($("body").text().replace(/\s+/g, "").length > 500) score += 10;
    if (canonical) score += 10;

    return {
      overview: { score, maxScore },
      onpage: {
        title,
        metaDescription,
        h1,
        h2,
        h3,
        imageCount: images.length,
        imagesWithAlt: withAlt,
        internalLinks,
        canonical,
      },
    };
  } catch (err) {
    console.error("SEO analyze error:", err.message);
    throw err;
  }
}
