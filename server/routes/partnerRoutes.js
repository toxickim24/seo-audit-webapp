// routes/partnerRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { PartnerController } from "../controllers/partnerController.js";

const router = express.Router();

// 🧩 Get partner info for logged-in user
router.get("/me", protect, PartnerController.getMyPartner);

// 🧩 Create or update partner settings
router.put("/", protect, PartnerController.updateOrCreate);

// 🧩 Public partner page (by slug)
router.get("/:slug", PartnerController.getBySlug);

export default router;
