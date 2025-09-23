import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";

import { analyzeOnPage } from "../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../src/api/SeoTechnical.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL Database Setup
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

  // Fallback objects
  let onPage = { overview: { score: 0 }, onpage: {} };
  let contentSeo = { overview: { score: 0 }, contentSeo: {} };
  let technicalSeo = { technicalSeo: {}, overview: { score: 0 } };

  try { onPage = await analyzeOnPage(url).catch(() => onPage); } catch {}
  try { contentSeo = await analyzeContentSeo(url).catch(() => contentSeo); } catch {}
  try { technicalSeo = await analyzeTechnicalSeo(url).catch(() => technicalSeo); } catch {}

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

// Email Route
app.post("/send-seo-email", async (req, res) => {
  const { email, pdfBlob } = req.body;

  if (!email || !pdfBlob) return res.status(400).json({ error: "Email and PDF required" });

  try {
    const pdfBuffer = Buffer.from(pdfBlob.split(",")[1], "base64");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your SEO Report",
      text: "Attached is your SEO report PDF.",
      attachments: [{ filename: "SEO_Report.pdf", content: pdfBuffer }],
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Leads Management Route (fail-safe)
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

// Create new lead
app.post("/leads", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not connected" });

  const { name, phone, company, email, website, overallScore, date } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO leads (name, phone, company, email, website, score, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, phone, company, email, website, overallScore, date]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Failed to insert lead:", err.message);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// Delete lead by ID
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

// Serve React build
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
