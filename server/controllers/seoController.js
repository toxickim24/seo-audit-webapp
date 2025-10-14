// server/controllers/seoController.js
import { analyzeOnPage } from "../services/analyzeOnPage.js";
import { analyzeContentSeo } from "../services/analyzeContentSeo.js";
import { analyzeTechnicalSeo } from "../services/analyzeTechnicalSeo.js";

/**
 * Handles GET /api/seo/analyze
 * Runs on-page, content, and technical analyzers in sequence
 * Returns averaged overview score and combined data
 */
export const SeoController = {
  async analyzeWebsite(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Default safe placeholders
    let onPage = { overview: { score: 0 }, onpage: {} };
    let contentSeo = { overview: { score: 0 }, contentSeo: {} };
    let technicalSeo = { overview: { score: 0 }, technicalSeo: {} };

    try {
      onPage = (await analyzeOnPage(url)) || onPage;
    } catch (err) {
      console.error("❌ On-page analysis failed:", err.message);
    }

    try {
      contentSeo = (await analyzeContentSeo(url)) || contentSeo;
    } catch (err) {
      console.error("❌ Content analysis failed:", err.message);
    }

    try {
      technicalSeo = (await analyzeTechnicalSeo(url)) || technicalSeo;
    } catch (err) {
      console.error("❌ Technical analysis failed:", err.message);
    }

    const overviewScore = Math.round(
      ((onPage.overview?.score || 0) +
        (contentSeo.overview?.score || 0) +
        (technicalSeo.overview?.score || 0)) / 3
    );

    res.json({
      url,
      overview: { score: overviewScore },
      onpage: onPage,
      contentSeo,
      technicalSeo,
      pageSpeed: null,
    });
  },
};
