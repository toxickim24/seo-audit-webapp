import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import OpenAI from "openai";   // ✅ add OpenAI

import { analyzeOnPage } from "../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../src/api/SeoTechnical.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    console.error("Details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      db: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
    db = null;
  }
}
initDB();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

/* ===========================
   ✅ NEW: OpenAI AI Route (with JSON Schema)
   =========================== */
app.post("/openai/seo-audit", async (req, res) => {
  const raw = req.body; // full SEOAuditResults JSON from frontend
  if (!raw || !raw.domain) {
    return res.status(400).json({ error: "Missing SEO audit input (expected at least a domain)" });
  }

  try {
    // Gather perf hints (for grounding)
    const perfHints = [
      ...(raw.performance?.desktop || []).map((p) => p.description || p.title),
      ...(raw.performance?.mobile || []).map((p) => p.description || p.title),
    ].filter(Boolean);

    const systemPrompt = `You are an expert Technical SEO lead. 
Return actionable, conservative recommendations:
- NEVER fabricate numbers.
- Only include est_speed_gain_sec when numeric hints exist.
- Prefer low-effort/high-impact items for quick wins.
- Write in friendly, non-technical English.
- Group fixes into a 4-week roadmap.`;

    const userMessages = [
      { role: "user", content: `RAW_AUDIT_RESULTS_JSON:\n${JSON.stringify(raw)}` },
      { role: "user", content: `PERFORMANCE_HINT_LINES:\n${perfHints.join("\n")}` },
      { role: "user", content: "Return the structured JSON for the analysis only." },
    ];

    // ✅ Strict JSON schema (same as tested in test-openai.js)
    const analysisSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        overall_summary: { type: "string" },
        quick_wins: {
          type: "array",
          items: { type: "string" }
        },
        category_notes: {
          type: "object",
          additionalProperties: false,
          properties: {
            onpage: { type: "string" },
            technical: { type: "string" },
            content: { type: "string" }
          },
          required: ["onpage", "technical", "content"]
        },
        prioritized_issues: {
          type: "array",
          minItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              issue: { type: "string" },
              priority: { type: "string", enum: ["High", "Medium", "Low"] }
            },
            required: ["issue", "priority"]
          }
        },
        roadmap_weeks: {
          type: "object",
          additionalProperties: false,
          properties: {
            week_1: { type: "array", items: { type: "string" } },
            week_2: { type: "array", items: { type: "string" } },
            week_3: { type: "array", items: { type: "string" } },
            week_4: { type: "array", items: { type: "string" } }
          },
          required: ["week_1", "week_2", "week_3", "week_4"]
        }
      },
      required: [
        "overall_summary",
        "quick_wins",
        "category_notes",
        "prioritized_issues",
        "roadmap_weeks"
      ]
    };

    // Call OpenAI
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ],
      text: {
        format: {
          type: "json_schema",
          name: "SeoAuditSchema",   // required
          schema: analysisSchema    // required
        }
      }
    });

    let parsed;
    try {
      parsed = JSON.parse(response.output_text || "{}");
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse AI output",
        raw: response.output_text
      });
    }

    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error("OpenAI route error:", err);
    res.status(500).json({ error: "AI analysis failed", details: err.message });
  }
});

// === your existing routes remain unchanged ===

// Main SEO analyze route
app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let onPage = { overview: { score: 0 }, onpage: {} };
  let contentSeo = { overview: { score: 0 }, contentSeo: {} };
  let technicalSeo = { technicalSeo: {}, overview: { score: 0 } };

  try { onPage = await analyzeOnPage(url).catch(() => onPage); } catch {}
  try { contentSeo = await analyzeContentSeo(url).catch(() => contentSeo); } catch {}
  try { technicalSeo = await analyzeTechnicalSeo(url).catch(() => technicalSeo); } catch {}

  const overviewScore = Math.round(
    ((onPage.overview?.score || 0) +
      (contentSeo.overview?.score || 0) +
      (technicalSeo.overview?.score || 0)) / 3
  );

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
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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

// Leads routes
app.get("/leads", async (req, res) => {
  if (!db) {
    return res.json([{ id: 1, name: "Demo Lead", email: "demo@example.com", website: "https://example.com", score: 75, date: new Date() }]);
  }
  try {
    const [rows] = await db.execute("SELECT * FROM leads WHERE is_deleted = 0 ORDER BY date DESC");
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.post("/leads", async (req, res) => {
  const { name, phone, company, email, website, overallScore, date } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!db) return res.status(201).json({ success: true, id: Date.now() });

  try {
    const [result] = await db.execute(
      "INSERT INTO leads (name, phone, company, email, website, score, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, phone, company, email, website, overallScore, date]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch {
    res.json({ success: true, id: Date.now() });
  }
});

app.delete("/leads/:id", async (req, res) => {
  const { id } = req.params;
  if (!db) return res.json({ success: true, message: "Lead marked as deleted (fake)" });

  try {
    await db.execute("UPDATE leads SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "Lead marked as deleted" });
  } catch {
    res.json({ success: true, message: "Lead marked as deleted (fake)" });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
