import express from "express";
import { SeoController } from "../controllers/seoController.js";
import { limiterStore } from "../middleware/auditLimiter.js";

const router = express.Router();

// ✅ Apply limiter dynamically via wrapper
router.get("/analyze", (req, res, next) =>
  limiterStore.auditLimiter(req, res, () =>
    SeoController.analyzeWebsite(req, res, next)
  )
);

export default router;
