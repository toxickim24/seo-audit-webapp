import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getSystemInsights } from "../controllers/adminSystemController.js";

const router = express.Router();

router.get("/insights", protect, requireRole("admin"), getSystemInsights);

export default router;
