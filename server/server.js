// ===========================
// ✅ Core Setup
// ===========================
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Load root .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ✅ Resolve dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===========================
// ✅ Middleware & Utils
// ===========================
import { logger } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ===========================
// ✅ Routes
// ===========================
import authRoutes from "./routes/authRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import partnerLeadRoutes from "./routes/partnerLeadRoutes.js";

// ===========================
// ✅ Database Init
// ===========================
import { initDB } from "./config/db.js";
await initDB();

// ===========================
// ✅ Express App Setup
// ===========================
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(logger);

// ===========================
// ✅ Mount API Routes (organized by group)
// ===========================

// 🔐 Auth (login/register)
app.use("/api/auth", authRoutes);

// 🧩 Partner management
app.use("/api/partners", partnerRoutes);

app.use("/api/partnerLeads", partnerLeadRoutes);

// 🔍 SEO Analysis
app.use("/api/seo", seoRoutes);

// 📋 Leads
app.use("/api/leads", leadRoutes);

// 📧 Email sending
app.use("/api/email", emailRoutes);

// 🤖 AI SEO Analyzer
app.use("/api/openai", aiRoutes);

// 📁 File uploads
app.use("/api/upload", uploadRoutes);

// ✅ Global error handler
app.use(errorHandler);

// ===========================
// ✅ Serve React build in production
// ===========================
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) =>
    res.sendFile(path.join(buildPath, "index.html"))
  );
}

// ===========================
// ✅ Start Server
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
