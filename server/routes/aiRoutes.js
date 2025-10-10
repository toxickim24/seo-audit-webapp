import express from "express";
import { runSeoAudit } from "../controllers/aiController.js";

const router = express.Router();
router.post("/openai/seo-audit", runSeoAudit);

export default router;
