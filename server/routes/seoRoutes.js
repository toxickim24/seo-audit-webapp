import express from "express";
import { SeoController } from "../controllers/seoController.js";
import { auditLimiter } from "../middleware/auditLimiter.js";

const router = express.Router();

router.get("/analyze", auditLimiter, SeoController.analyzeWebsite);

export default router;