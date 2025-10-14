import express from "express";
import { runSeoAudit } from "../controllers/aiController.js";

const router = express.Router();

// ✅ Route definition
router.post("/seo-audit", runSeoAudit);

export default router;
