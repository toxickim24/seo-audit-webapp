import express from "express";
import { limiterStore } from "../middleware/auditLimiter.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    // ✅ Recreate a brand-new limiter instance (true reset)
    limiterStore.auditLimiter = limiterStore.createLimiter();

    console.log("🧹 Fully reset rate limiter — new instance created.");
    res.json({
      success: true,
      message:
        "✅ Rate-limit fully cleared. You can now run another SEO audit immediately.",
    });
  } catch (err) {
    console.error("❌ Failed to reset limiter:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset limiter." });
  }
});

export default router;
