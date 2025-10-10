import express from "express";
import { sendSeoEmail } from "../controllers/emailController.js";

const router = express.Router();
router.post("/send-seo-email", sendSeoEmail);

export default router;
