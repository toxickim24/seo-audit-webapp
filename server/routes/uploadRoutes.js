import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// ✅ Ensure uploads directory exists
// ============================================================
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ============================================================
// ✅ Helper: Fetch partner_id safely
// ============================================================
async function getPartnerId(userId) {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id FROM partners WHERE user_id = ? LIMIT 1",
      [userId]
    );
    return rows[0]?.id || "unknown";
  } catch (err) {
    console.error("❌ Failed to get partner ID:", err);
    return "unknown";
  }
}

// ============================================================
// ✅ Multer Storage (safe async partner lookup)
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    // Wrap async lookup in a Promise
    (async () => {
      const partnerId = await getPartnerId(req.user.id);
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `partner_${partnerId}_logo${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // ✅ Overwrite old logo if exists
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      cb(null, fileName);
    })().catch((err) => {
      console.error("❌ Partner lookup failed:", err);
      cb(null, `partner_unknown_logo${path.extname(file.originalname)}`);
    });
  },
});

// ============================================================
// ✅ Filter: Images only
// ============================================================
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

// ============================================================
// ✅ Initialize Multer
// ============================================================
const upload = multer({ storage, fileFilter });

// ============================================================
// ✅ Route: POST /api/upload/logo
// ============================================================
router.post("/logo", protect, upload.single("logo"), (req, res) => {
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "Upload successful",
      url: fileUrl,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

export default router;
