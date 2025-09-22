import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

import { analyzeOnPage } from "../src/api/SeoOnpage.js";
import { analyzeContentSeo } from "../src/api/SeoContent.js";
import { analyzeTechnicalSeo } from "../src/api/SeoTechnical.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger middleware removed

// Main SEO Analyze Route
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

// Serve React build
app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);