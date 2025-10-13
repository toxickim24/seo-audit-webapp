// server/routes/authRoutes.js
import express from "express";
import { AuthController } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// ✅ Protected route
router.get("/me", protect, AuthController.me);

export default router;
