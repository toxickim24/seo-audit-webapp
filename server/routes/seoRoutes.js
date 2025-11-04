import express from "express";
import { SeoController } from "../controllers/seoController.js";
import { limiterStore } from "../middleware/auditLimiter.js";

const router = express.Router();

router.get("/analyze", (req, res, next) => {
  const hasPartner = Boolean(req.query.partner_id);

  if (hasPartner) {
    // 🚀 Skip limiter for partner requests
    return SeoController.analyzeWebsite(req, res, next);
  }

  // 🧱 Apply limiter for public scans
  return limiterStore.auditLimiter(req, res, () =>
    SeoController.analyzeWebsite(req, res, next)
  );
});

export default router;