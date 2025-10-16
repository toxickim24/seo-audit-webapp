import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// ✅ Base upload directory
// ============================================================
const baseUploadDir = path.resolve("server/uploads/partners");
if (!fs.existsSync(baseUploadDir)) fs.mkdirSync(baseUploadDir, { recursive: true });

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
    return rows[0]?.id || null;
  } catch (err) {
    console.error("❌ Failed to get partner ID:", err);
    return null;
  }
}

// ============================================================
// ✅ Multer Storage
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, baseUploadDir);
  },
  filename: async (req, file, cb) => {
    try {
      const partnerId = await getPartnerId(req.user.id);
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `partner_${partnerId || "unknown"}_logo${ext}`;
      const filePath = path.join(baseUploadDir, fileName);

      // 🧹 Remove old logo if it exists
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      cb(null, fileName);
    } catch (err) {
      console.error("❌ Error generating filename:", err);
      cb(null, `partner_unknown_logo${path.extname(file.originalname)}`);
    }
  },
});

// ============================================================
// ✅ File Filter (images only)
// ============================================================
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

// ============================================================
// ✅ POST /api/upload/logo → Upload + Save to DB
// ============================================================
router.post("/logo", protect, upload.single("logo"), async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const [partnerRows] = await db.query(
      "SELECT id FROM partners WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!partnerRows.length) {
      return res.status(404).json({ success: false, error: "Partner not found" });
    }

    const partnerId = partnerRows[0].id;
    const fileUrl = `/uploads/partners/${req.file.filename}`;

    await db.query("UPDATE partners SET logo_url = ? WHERE id = ?", [
      fileUrl,
      partnerId,
    ]);

    res.json({
      success: true,
      message: "✅ Logo uploaded and saved successfully!",
      url: fileUrl,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// ============================================================
// ✅ DELETE /api/upload/logo → Remove logo file + clear DB
// ============================================================
router.delete("/logo", protect, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT id, logo_url FROM partners WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, error: "Partner not found" });

    const partner = rows[0];
    const logoPath = path.join(process.cwd(), "server", partner.logo_url || "");

    if (partner.logo_url && fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    await db.query("UPDATE partners SET logo_url = NULL WHERE id = ?", [
      partner.id,
    ]);

    res.json({ success: true, message: "✅ Logo removed successfully." });
  } catch (err) {
    console.error("❌ Logo delete failed:", err);
    res.status(500).json({ success: false, error: "Logo delete failed" });
  }
});

export default router;
