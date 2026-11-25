import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { AdminUserController } from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), AdminUserController.getAllUsers);
router.post("/", protect, requireRole("admin"), AdminUserController.createUser);
router.put("/:id", protect, requireRole("admin"), AdminUserController.updateUser);
router.delete("/:id", protect, requireRole("admin"), AdminUserController.softDeleteUser);
router.put("/:id/restore", protect, requireRole("admin"), AdminUserController.restoreUser);
router.put("/:id/password", protect, requireRole("admin"), AdminUserController.changePassword);
router.get("/export", protect, requireRole("admin"), AdminUserController.exportUsersCSV);

export default router;