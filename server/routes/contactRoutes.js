import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", sendContactMessage);

router.post("/partner-contact", sendContactMessage);

export default router;
