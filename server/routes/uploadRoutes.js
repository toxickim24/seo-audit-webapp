import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// ✅ Ensure upload folder exists
// ============================================================
const uploadDir = path.join(process.cwd(), "server/uploads/partners");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// ✅ Multer Configuration
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // ✅ fixed here
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".png").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)
      ? ext
      : ".png";
    const unique = Date.now();
    cb(null, `logo-${unique}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Invalid file type. Please upload an image."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB limit
});

// ============================================================
// ✅ Upload Partner Logo (used by Admin & Partner)
// ============================================================
router.post("/logo", protect, upload.single("logo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const fileUrl = `/uploads/partners/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Logo uploaded successfully.",
      url: fileUrl,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading file.",
    });
  }
});

// ============================================================
// ✅ Handle Multer Errors Gracefully
// ============================================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum allowed size is 3 MB.",
      });
    }
  }

  if (err.message === "Invalid file type. Please upload an image.") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error("❌ Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Unexpected error occurred while uploading.",
  });
});

export default router;
