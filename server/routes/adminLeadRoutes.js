import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLeads, addLead, deleteLead } from "../controllers/adminLeadController.js";

const router = express.Router();

router.get("/", protect, getLeads);
router.post("/", addLead); // public — users submit leads without auth
router.delete("/:id", protect, deleteLead);

export default router;
