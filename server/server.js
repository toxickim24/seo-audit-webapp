import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";
import clearLimitRoute from "./routes/clearLimitRoute.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import partnerLeadRoutes from "./routes/partnerLeadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminLeadRoutes from "./routes/adminLeadRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminPartnerRoutes from "./routes/adminPartnerRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";
import adminSystemRoutes from "./routes/adminSystemRoutes.js";
import { initDB } from "./config/db.js";

// top-level logic wrapped in async function
(async () => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  await initDB();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(logger);

  app.use("/api/clear", clearLimitRoute);

  app.use("/uploads/partners", express.static(path.join(process.cwd(), "server/uploads/partners")));

  app.use("/api/auth", authRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/partners", partnerRoutes);
  app.use("/api/partnerLeads", partnerLeadRoutes);
  app.use("/api/seo", seoRoutes);
  app.use("/api/email", emailRoutes);
  app.use("/api/openai", aiRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/adminLeads", adminLeadRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/admin/partners", adminPartnerRoutes);
  app.use("/api/admin/activity", adminActivityRoutes);
  app.use("/api/admin/system", adminSystemRoutes);
  app.use(errorHandler);

  if (process.env.NODE_ENV === "production") {
    let buildPath = path.join(__dirname, "../build");
    if (!fs.existsSync(buildPath)) buildPath = path.join(__dirname, "build");
    app.use(express.static(buildPath));
    app.use((req, res) => res.sendFile(path.join(buildPath, "index.html")));
    console.log(`✅ Serving React build from: ${buildPath}`);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();