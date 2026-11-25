import express from "express";
import { addActivity, getRecentActivities } from "../controllers/adminActivityController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), getRecentActivities);
router.post("/add", protect, requireRole("admin"), addActivity);

export default router;