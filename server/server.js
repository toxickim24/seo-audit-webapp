// ===========================
// ✅ Core Setup
// ===========================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ===========================
// ✅ Middleware
// ===========================
import { logger } from "./middleware/loggerMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ===========================
// ✅ Routes
// ===========================
import seoRoutes from "./routes/seoRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// ===========================
// ✅ Database Init
// ===========================
import { initDB } from "./config/db.js";
await initDB();

// ===========================
// ✅ Express App Config
// ===========================
const app = express();
app.use(logger); // logs every request
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));

// ===========================
// ✅ Route Mounts
// ===========================
app.use("/", seoRoutes);
app.use("/", leadRoutes);
app.use("/", emailRoutes);
app.use("/", aiRoutes);

// ===========================
// ✅ Serve React Build
// ===========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// ===========================
// ✅ Global Error Handler
// ===========================
app.use(errorHandler);

// ===========================
// ✅ Start Server
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);