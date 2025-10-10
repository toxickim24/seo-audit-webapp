import express from "express";
import { analyzeWebsite } from "../controllers/seoController.js";

const router = express.Router();
router.get("/analyze", analyzeWebsite);

export default router;
