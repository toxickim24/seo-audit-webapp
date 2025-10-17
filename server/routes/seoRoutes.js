import express from "express";
import { SeoController } from "../controllers/seoController.js";

const router = express.Router();

// ✅ GET /api/seo/analyze
// Optional partner_id parameter will trigger credit deduction
router.get("/analyze", SeoController.analyzeWebsite);

export default router;
