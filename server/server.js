import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise"; // ✅ mysql2 for async/await
import dotenv from "dotenv"; // ✅ load .env
import { analyzeOnPage } from "../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../src/api/SeoTechnical.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// MySQL Database Setup
// =======================
let db = null;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
    console.log("✅ MySQL connected successfully");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    db = null; // keep app running even if DB is down
  }
}
initDB();

// =======================
// Logger
// =======================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

// =======================
// Main SEO analyze route
// =======================
app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Fallback objects
  let onPage = { overview: { score: 0 }, onpage: {} };
  let contentSeo = { overview: { score: 0 }, contentSeo: {} };
  let technicalSeo = { technicalSeo: {}, overview: { score: 0 } };

  try {
    onPage = await analyzeOnPage(url).catch((err) => {
      console.error("analyzeOnPage failed:", err.message);
      return onPage;
    });
  } catch {}

  try {
    contentSeo = await analyzeContentSeo(url).catch((err) => {
      console.error("analyzeContentSeo failed:", err.message);
      return contentSeo;
    });
  } catch {}

  try {
    technicalSeo = await analyzeTechnicalSeo(url).catch((err) => {
      console.error("analyzeTechnicalSeo failed:", err.message);
      return technicalSeo;
    });
  } catch {}

  // Calculate overview score
  const overviewScore = Math.round(
    ((onPage.overview?.score || 0) +
      (contentSeo.overview?.score || 0) +
      (technicalSeo.overview?.score || 0)) /
      3
  );

  // ✅ Attempt to save into DB (but don’t break app if DB is down)
  if (db) {
    try {
      await db.execute(
        "INSERT INTO leads (name, email, phone, company, website, score, date) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [
          "Test User",        // you can replace with real values later
          "test@example.com",
          "123-456-7890",
          "SEO Test Co",
          url,
          overviewScore,
        ]
      );
      console.log("✅ Data inserted into MySQL");
    } catch (err) {
      console.error("❌ Failed to insert into MySQL:", err.message);
    }
  } else {
    console.warn("⚠️ Skipping DB insert — no connection");
  }

  // Response
  res.json({
    url,
    overview: { score: overviewScore },
    onpage: onPage,
    contentSeo: contentSeo,
    technicalSeo: technicalSeo,
    pageSpeed: null,
  });
});

// =======================
// Leads Management Route (fail-safe)
// =======================
app.get("/leads", async (req, res) => {
  if (!db) {
    console.warn("⚠️ No database connection");
    return res.json([]); // ✅ safe fallback
  }

  try {
    const [rows] = await db.execute("SELECT * FROM leads ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch leads:", err.message);
    res.json([]); // ✅ safe fallback
  }
});

// =======================
// Delete lead by ID
// =======================
app.delete("/leads/:id", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not connected" });

  try {
    const { id } = req.params;
    await db.execute("DELETE FROM leads WHERE id = ?", [id]);
    res.json({ success: true, message: "Lead deleted" });
  } catch (err) {
    console.error("❌ Failed to delete lead:", err.message);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

// =======================
// Serve React build
// =======================
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
