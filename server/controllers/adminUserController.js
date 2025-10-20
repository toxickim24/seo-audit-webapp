import { getDB } from "../config/db.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const AdminUserController = {
  async getAllUsers(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(
        "SELECT id, name, email, role, created_at, updated_at, is_deleted FROM users ORDER BY id DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const db = getDB();
      const hashed = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
        [name, email, hashed, role || "partner"]
      );

      res.json({ success: true, message: "User created successfully" });
    } catch (err) {
      console.error("❌ Error creating user:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to create user",
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      const db = getDB();
      await db.query(
        "UPDATE users SET name=?, email=?, role=?, updated_at=NOW() WHERE id=?",
        [name, email, role, id]
      );
      res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
      console.error("❌ Error updating user:", err);
      res.status(500).json({ error: "Failed to update user" });
    }
  },

  // ============================================================
  // ✅ Soft Delete User
  // ============================================================
  async softDeleteUser(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      await db.query("UPDATE users SET is_deleted = 1 WHERE id = ?", [id]);
      res.json({ success: true, message: "User moved to trash." });
    } catch (err) {
      console.error("❌ Error soft deleting user:", err);
      res.status(500).json({ error: "Failed to delete user." });
    }
  },

  // ============================================================
  // ✅ Restore User
  // ============================================================
  async restoreUser(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      await db.query("UPDATE users SET is_deleted = 0 WHERE id = ?", [id]);
      res.json({ success: true, message: "User restored successfully!" });
    } catch (err) {
      console.error("❌ Error restoring user:", err);
      res.status(500).json({ error: "Failed to restore user." });
    }
  },

  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      const db = getDB();
      await db.query("UPDATE users SET password=? WHERE id=?", [hashed, id]);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error("❌ Error updating password:", err);
      res.status(500).json({ error: "Failed to update password" });
    }
  },

  async exportUsersCSV(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(
        "SELECT id, name, email, role, created_at FROM users WHERE is_deleted = 0"
      );
      const parser = new Parser();
      const csv = parser.parse(rows);
      const filePath = path.join("server/uploads", `users_${Date.now()}.csv`);
      fs.writeFileSync(filePath, csv);
      res.download(filePath);
    } catch (err) {
      console.error("❌ Error exporting CSV:", err);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  },
};
