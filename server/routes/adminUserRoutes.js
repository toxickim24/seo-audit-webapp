import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { AdminUserController } from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", protect, AdminUserController.getAllUsers);
router.post("/", protect, AdminUserController.createUser);
router.put("/:id", protect, AdminUserController.updateUser);
router.delete("/:id", protect, AdminUserController.softDeleteUser);
router.put("/:id/restore", protect, AdminUserController.restoreUser);
router.put("/:id/password", protect, AdminUserController.changePassword);
router.get("/export", protect, AdminUserController.exportUsersCSV);

export default router;