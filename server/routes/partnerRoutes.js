import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { PartnerController } from "../controllers/partnerController.js";

const router = express.Router();

router.get("/partner/me", protect, PartnerController.getMyPartner);
router.put("/partner", protect, PartnerController.updateOrCreate);
router.get("/partner/:slug", PartnerController.getBySlug);

export default router;
