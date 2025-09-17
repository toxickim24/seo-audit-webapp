import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  // validate URL early
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    console.log("Fetching:", url);

    // ✅ Updated Axios block
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.status >= 400) {
      console.error("Upstream returned status:", response.status);
      return res
        .status(502)
        .json({ error: "Upstream server error", status: response.status });
    }

    const $ = cheerio.load(response.data);

    const title = $("title").text().trim() || "";
    const metaDescription =
      $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1")
      .map((i, el) => $(el).text().trim())
      .get();
    const h2 = $("h2")
      .map((i, el) => $(el).text().trim())
      .get();
    const h3 = $("h3")
      .map((i, el) => $(el).text().trim())
      .get();

    // Scoring System
    let score = 0;
    const maxScore = 100;
    if (title && title.length <= 60) score += 15;
    if (metaDescription && metaDescription.length <= 160) score += 15;
    if (h1.length > 0) score += 10;
    if (h2.length > 0) score += 10;

    const images = $("img");
    let withAlt = 0;
    images.each((i, img) => {
      if ($(img).attr("alt") && $(img).attr("alt").trim() !== "") withAlt++;
    });
    if (images.length > 0 && withAlt === images.length) score += 10;

    const internalLinks = $("a[href]").filter((i, el) => {
      const href = $(el).attr("href");
      try {
        return (
          href &&
          (href.startsWith("/") ||
            new URL(href, url).hostname === new URL(url).hostname)
        );
      } catch {
        return false;
      }
    }).length;
    if (internalLinks > 0) score += 10;

    if ($("body").text().replace(/\s+/g, "").length > 500) score += 10;

    const canonical = $('link[rel="canonical"]').attr("href") || "";
    if (canonical) score += 10;

    res.json({
      url,
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
    });
  } catch (err) {
    // more detailed logging for debugging
    console.error("Analyze error:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response headers:", err.response.headers);
      console.error(
        "Response data snippet:",
        String(err.response.data).slice(0, 500)
      );
    } else if (err.code) {
      console.error("Error code:", err.code);
    }
    res
      .status(500)
      .json({ error: "Failed to analyze site.", details: err.message });
  }
});

// serve react build (production)
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
