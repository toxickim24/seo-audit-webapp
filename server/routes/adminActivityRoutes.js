import express from "express";
import { addActivity, getRecentActivities } from "../controllers/adminActivityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecentActivities);
router.post("/add", protect, addActivity);

export default router;