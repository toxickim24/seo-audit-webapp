import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeOnPage } from "../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../src/api/SeoTechnical.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

// Main SEO analyze route
app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Fallback
  let onPage = { overview: { score: 0 }, onpage: {} };
  let contentSeo = { overview: { score: 0 }, contentSeo: {} };
  let technicalSeo = { technicalSeo: {}, overview: { score: 0 } };

  try {
    onPage = await analyzeOnPage(url).catch(err => {
      console.error("analyzeOnPage failed:", err.message);
      return onPage;
    });
  } catch {}

  try {
    contentSeo = await analyzeContentSeo(url).catch(err => {
      console.error("analyzeContentSeo failed:", err.message);
      return contentSeo;
    });
  } catch {}

  try {
    technicalSeo = await analyzeTechnicalSeo(url).catch(err => {
      console.error("analyzeTechnicalSeo failed:", err.message);
      return technicalSeo;
    });
  } catch {}

  // Overall score
  const overviewScore = Math.round(
    ((onPage.overview?.score || 0) +
      (contentSeo.overview?.score || 0) +
      (technicalSeo.overview?.score || 0)) / 3
  );

  // Send JSON response
  res.json({
    url,
    overview: { score: overviewScore },
    onpage: onPage,
    contentSeo: contentSeo,
    technicalSeo: technicalSeo,
    pageSpeed: null,
  });
});

// Serve React build
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
