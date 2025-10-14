import axios from "axios";
import * as cheerio from "cheerio";

export async function analyzeOnPage(url) {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(response.data);

    // Headings
    const h1 = $("h1").map((i, el) => $(el).text().trim()).get();
    const h2 = $("h2").map((i, el) => $(el).text().trim()).get();
    const h3 = $("h3").map((i, el) => $(el).text().trim()).get();
    const h4 = $("h4").map((i, el) => $(el).text().trim()).get();
    const h5 = $("h5").map((i, el) => $(el).text().trim()).get();
    const h6 = $("h6").map((i, el) => $(el).text().trim()).get();

    const headingCount = {
      h1: h1.length,
      h2: h2.length,
      h3: h3.length,
      h4: h4.length,
      h5: h5.length,
      h6: h6.length
    };

    const headingsPass = h1.length === 1 && h2.length > 0; // Basic Google standard

    // Images
    const images = $("img");
    const imageDetails = images.map((i, el) => ({
      src: $(el).attr("src") || "<no src>",
      alt: $(el).attr("alt")?.trim() || null,
      hasAlt: !!$(el).attr("alt")?.trim(),
    })).get();

    const imagesWithAlt = imageDetails.filter(img => img.hasAlt).length;
    const imagesWithoutAlt = imageDetails.filter(img => !img.hasAlt).length;
    const imagesPass = images.length > 0 && imagesWithoutAlt === 0;

    // Links
    const allLinks = $("a[href]");
    let internalLinks = 0;
    let externalLinks = 0;
    let brokenLinks = 0;

    allLinks.each((i, el) => {
      const href = $(el).attr("href");
      if (!href || href.trim() === "" || href === "#") brokenLinks++;
      else {
        try {
          const linkURL = new URL(href, url);
          if (linkURL.hostname === new URL(url).hostname) internalLinks++;
          else externalLinks++;
        } catch {
          brokenLinks++;
        }
      }
    });

    const internalLinksPass = internalLinks > 0;
    const externalLinksPass = externalLinks > 0;
    const brokenLinksPass = brokenLinks === 0;
    const linksPass = internalLinksPass && brokenLinksPass;

    // Basic elements
    const title = $("title").text().trim() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const ogDescription = $('meta[property="og:description"]').attr("content") || "";
    const twitterCard = $('meta[name="twitter:card"]').attr("content") || "";
    const structuredData = $('script[type="application/ld+json"]').length > 0;

    // Pass/fail checks
    const titlePass = title && title.length <= 60;
    const metaPass = metaDescription && metaDescription.length <= 160;
    const h1Pass = h1.length === 1;
    const h2Pass = h2.length > 0;
    const socialPass = ogTitle && ogDescription && twitterCard;
    const structuredPass = structuredData;
    const bodyPass = $("body").text().replace(/\s+/g, "").length > 500;

    // Scoring
    let score = 0;
    const maxScore = 100;
    if (titlePass) score += 10;
    if (metaPass) score += 10;
    if (h1Pass) score += 10;
    if (h2Pass) score += 5;
    if (h3.length > 0) score += 5;
    if (imagesPass) score += 10;
    if (linksPass) score += 10;
    if (bodyPass) score += 10;
    if (socialPass) score += 10;
    if (structuredPass) score += 5;

    return {
      overview: { score, maxScore },
      onpage: {
        title,
        titlePass,
        metaDescription,
        metaPass,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        headingCount,
        headingsPass,
        h1Pass,
        h2Pass,
        h3Pass: h3.length > 0,
        h4Pass: h4.length > 0,
        h5Pass: h5.length > 0,
        h6Pass: h6.length > 0,
        imageCount: images.length,
        imagesWithAlt,
        imagesWithoutAlt,
        imagesPass,
        internalLinks,
        internalLinksPass,
        externalLinks,
        externalLinksPass,
        brokenLinks,
        brokenLinksPass,
        linksPass,
        ogTitle,
        ogDescription,
        twitterCard,
        socialPass,
        structuredData,
        structuredPass,
        bodyPass,
      }
    };
  } catch (err) {
    console.error("SEO analyze error:", err.message);
    throw err;
  }
}