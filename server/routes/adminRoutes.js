import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { AdminController } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, requireRole("admin"), AdminController.getStats);
router.get("/settings", protect, requireRole("admin"), AdminController.getSettings);
router.put("/settings", protect, requireRole("admin"), AdminController.updateSettings);

export default router;
