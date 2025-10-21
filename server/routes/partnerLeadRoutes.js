import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { PartnerLeadController } from "../controllers/partnerLeadController.js";

const router = express.Router();

// ✅ Get partner leads
router.get("/", protect, PartnerLeadController.getMyLeads);

// ✅ Add new lead
router.post("/", PartnerLeadController.addLead);

// ✅ Delete lead
router.delete("/:id", protect, PartnerLeadController.deleteLead);

export default router;
