import { analyzeOnPage } from "../../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../../src/api/SeoTechnical.js";

/**
 * Handles GET /analyze
 * Runs the on-page, content, and technical analyzers in sequence
 * Returns averaged overview score and data bundle
 */
export async function analyzeWebsite(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let onPage = { overview: { score: 0 }, onpage: {} };
  let contentSeo = { overview: { score: 0 }, contentSeo: {} };
  let technicalSeo = { overview: { score: 0 }, technicalSeo: {} };

  try { onPage = await analyzeOnPage(url).catch(() => onPage); } catch {}
  try { contentSeo = await analyzeContentSeo(url).catch(() => contentSeo); } catch {}
  try { technicalSeo = await analyzeTechnicalSeo(url).catch(() => technicalSeo); } catch {}

  const overviewScore = Math.round(
    ((onPage.overview?.score || 0) +
      (contentSeo.overview?.score || 0) +
      (technicalSeo.overview?.score || 0)) / 3
  );

  return res.json({
    url,
    overview: { score: overviewScore },
    onpage: onPage,
    contentSeo,
    technicalSeo,
    pageSpeed: null,
  });
}
