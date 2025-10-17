// server/controllers/seoController.js
import { analyzeOnPage } from "../services/analyzeOnPage.js";
import { analyzeContentSeo } from "../services/analyzeContentSeo.js";
import { analyzeTechnicalSeo } from "../services/analyzeTechnicalSeo.js";
import { getDB } from "../config/db.js";

/**
 * ✅ Utility: check and deduct partner credits
 */
async function checkAndUsePartnerCredit(partnerId) {
  const db = getDB();
  const [[partner]] = await db.query(
    "SELECT credits FROM partners WHERE id = ? LIMIT 1",
    [partnerId]
  );

  if (!partner) throw new Error("Partner not found");
  if (partner.credits <= 0) {
    return { allowed: false, remaining: 0 };
  }

  // Deduct 1 credit
  await db.query("UPDATE partners SET credits = credits - 1 WHERE id = ?", [
    partnerId,
  ]);

  return { allowed: true, remaining: partner.credits - 1 };
}

/**
 * Handles GET /api/seo/analyze
 * Runs on-page, content, and technical analyzers in sequence
 * Returns averaged overview score and combined data
 */
export const SeoController = {
  async analyzeWebsite(req, res) {
    const { url, partner_id } = req.query;

    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    try {
      // ✅ Check partner credits if partner_id is passed
      if (partner_id) {
        const result = await checkAndUsePartnerCredit(partner_id);
        if (!result.allowed) {
          return res.status(403).json({
            error: "No credits left. Please contact support to top up.",
          });
        }
      }
    } catch (err) {
      console.error("❌ Credit check failed:", err.message);
      return res.status(500).json({ error: "Error verifying partner credits" });
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
