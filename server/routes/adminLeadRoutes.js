import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getLeads, addLead, deleteLead } from "../controllers/adminLeadController.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), getLeads);
router.post("/", addLead); // public — users submit leads without auth
router.delete("/:id", protect, requireRole("admin"), deleteLead);

export default router;
