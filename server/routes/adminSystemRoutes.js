import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSystemInsights } from "../controllers/adminSystemController.js";

const router = express.Router();

router.get("/insights", protect, getSystemInsights);

export default router;
