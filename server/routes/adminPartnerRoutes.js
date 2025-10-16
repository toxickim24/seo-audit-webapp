import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { AdminPartnerController } from "../controllers/adminPartnerController.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), AdminPartnerController.getAllPartners);
router.post("/", protect, requireRole("admin"), AdminPartnerController.addPartner);
router.put("/:id", protect, requireRole("admin"), AdminPartnerController.updatePartner);
router.delete("/:id", protect, requireRole("admin"), AdminPartnerController.softDeletePartner);
router.put("/:id/restore", protect, requireRole("admin"), AdminPartnerController.restorePartner);

export default router;
