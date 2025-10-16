import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { AdminController } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, requireRole("admin"), AdminController.getStats);

// GET all partners (Admin only)
router.get("/partners", protect, requireRole("admin"), AdminController.getAllPartners);

// POST new partner (optional)
router.post("/partners", protect, requireRole("admin"), AdminController.addPartner);

// PUT update partner (optional)
router.put("/partners/:id", protect, requireRole("admin"), AdminController.updatePartner);

// DELETE partner (optional)
router.delete("/partners/:id", protect, requireRole("admin"), AdminController.deletePartner);

router.get("/settings", protect, requireRole("admin"), AdminController.getSettings);
router.put("/settings", protect, requireRole("admin"), AdminController.updateSettings);

export default router;
