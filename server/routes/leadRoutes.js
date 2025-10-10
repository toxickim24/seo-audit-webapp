import express from "express";
import { getLeads, addLead, deleteLead } from "../controllers/leadController.js";

const router = express.Router();

router.get("/leads", getLeads);
router.post("/leads", addLead);
router.delete("/leads/:id", deleteLead);

export default router;
