import express from "express";
import multer from "multer";
import fs from "fs";
import { sendResellerRequest } from "../controllers/resellerController.js";

const router = express.Router();

// Upload setup
const uploadDir = "server/uploads/partners";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Upload route
router.post("/logo", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/partners/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// ✅ Email route (uses controller)
router.post("/", sendResellerRequest);

export default router;