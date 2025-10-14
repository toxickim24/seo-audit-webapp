// src/api/SeoTechnical.js
import axios from "axios";
import * as cheerio from "cheerio";
import { parseStringPromise } from "xml2js";

export async function analyzeTechnicalSeo(url) {
  const result = { technicalSeo: {}, overview: { score: 0 } };

  try {
    // --- Robots.txt ---
    const robotsTxtUrl = new URL("/robots.txt", url).href;
    result.technicalSeo.robotsTxtUrl = robotsTxtUrl;
    result.technicalSeo.sitemapUrl = null;
    result.technicalSeo.disallowedPaths = [];

    try {
      const res = await axios.get(robotsTxtUrl, { timeout: 5000 });
      const robotsData = res.data;

      // Sitemap URL
      const sitemapMatch = robotsData.match(/Sitemap:\s*(.+)/i);
      result.technicalSeo.sitemapUrl = sitemapMatch ? sitemapMatch[1].trim() : null;

      // Disallowed paths
      robotsData.split("\n").forEach(line => {
        if (line.toLowerCase().startsWith("disallow:")) {
          const path = line.split(":")[1]?.trim();
          if (path) result.technicalSeo.disallowedPaths.push(path);
        }
      });
    } catch (err) {
      console.warn("robots.txt fetch failed:", err.message);
    }

    // --- Page HTML ---
    let pageRes;
    try {
      pageRes = await axios.get(url, { timeout: 10000 });
    } catch (err) {
      console.warn("Page fetch failed:", err.message);
      pageRes = { data: "", headers: {} };
    }

    const $ = cheerio.load(pageRes.data || "");

    // --- Basic Technical Checks ---
    result.technicalSeo.canonical = $("link[rel='canonical']").attr("href") || null;
    result.technicalSeo.canonicalConflict = $("link[rel='canonical']").length > 1;
    result.technicalSeo.hasViewport = $("meta[name='viewport']").length > 0;
    result.technicalSeo.https = url.startsWith("https://");
    result.technicalSeo.hasFavIcon = $("link[rel='icon'], link[rel='shortcut icon']").length > 0;
    result.technicalSeo.hreflang = $("link[rel='alternate'][hreflang]").length > 0;
    const httpAssets = $("link[href^='http:'], script[src^='http:'], img[src^='http:']").length;
    result.technicalSeo.mixedContent = httpAssets > 0;
    result.technicalSeo.isWWW = new URL(url).hostname.startsWith("www.");
    result.technicalSeo.trailingSlash = url.endsWith("/");
    const contentLength = parseInt(pageRes.headers["content-length"]) || 0;
    result.technicalSeo.pageSizeKB = contentLength > 0 ? Math.round(contentLength / 1024) : null;
    result.technicalSeo.numRequests = $("img, link[rel='stylesheet'], script").length;
    result.technicalSeo.hasAMP = $("link[rel='amphtml']").length > 0;

    // --- Robots Meta (index/follow) ---
    const robotsMeta = $("meta[name='robots']").attr("content") || "";
    result.technicalSeo.hasRobotsMeta = robotsMeta !== "";
    result.technicalSeo.robotsIndex = /noindex/i.test(robotsMeta) ? "Failed" : "Pass";
    result.technicalSeo.robotsFollow = /nofollow/i.test(robotsMeta) ? "Failed" : "Pass";

    // --- Sitemap URLs Validity ---
    result.technicalSeo.sitemapValidUrls = [];
    if (result.technicalSeo.sitemapUrl) {
      try {
        const sitemapRes = await axios.get(result.technicalSeo.sitemapUrl, { timeout: 5000 });
        const parsed = await parseStringPromise(sitemapRes.data);
        let urls = [];

        // Sitemap
        if (parsed.urlset?.url) {
          urls = parsed.urlset.url.map(u => u.loc[0]);
        }
        // Sitemap
        else if (parsed.sitemapindex?.sitemap) {
          urls = parsed.sitemapindex.sitemap.map(s => s.loc[0]);
        }

        const urlsToCheck = urls.slice(0, 20); // limit to 10 URLs Site Valid URLS
        const promises = urlsToCheck.map(u =>
          axios.head(u, { timeout: 3000 })
            .then(r => ({ url: u, status: r.status }))
            .catch(() => ({ url: u, status: "error" }))
        );

        result.technicalSeo.sitemapValidUrls = await Promise.all(promises);

      } catch (err) {
        console.warn("Sitemap fetch/parse failed:", err.message);
      }
    }

    // --- Overview Score ---
    const overviewChecks = [
      result.technicalSeo.hasViewport ? 1 : 0,
      result.technicalSeo.https ? 1 : 0,
      result.technicalSeo.canonical ? 1 : 0,
      !result.technicalSeo.canonicalConflict ? 1 : 0,
      !result.technicalSeo.mixedContent ? 1 : 0,
      result.technicalSeo.pageSizeKB && result.technicalSeo.pageSizeKB < 2048 ? 1 : 0,
      result.technicalSeo.numRequests && result.technicalSeo.numRequests < 100 ? 1 : 0,
      result.technicalSeo.hasFavIcon ? 1 : 0,
      result.technicalSeo.hreflang ? 1 : 0,
      result.technicalSeo.isWWW ? 1 : 0,
      result.technicalSeo.trailingSlash ? 1 : 0,
      result.technicalSeo.hasAMP ? 1 : 0,
      result.technicalSeo.hasRobotsMeta ? 1 : 0,
    ];
    result.overview.score = Math.round((overviewChecks.reduce((a, b) => a + b, 0) / overviewChecks.length) * 100);

  } catch (err) {
    console.error("analyzeTechnicalSeo error:", err.message);
  }

  return result;
}
