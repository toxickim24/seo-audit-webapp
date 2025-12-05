import { getDB } from "../config/db.js";
import { logActivity } from "../utils/logActivity.js";

export const AdminPartnerController = {
  // ==========================================================
  // ✅ Get all partners
  // ==========================================================
  async getAllPartners(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(`
        SELECT p.id, p.company_name, p.slug, p.logo_url, p.booking_link,
               p.primary_color, p.secondary_color, p.accent_color, p.credits,
               p.is_deleted, p.created_at, p.updated_at,
               u.name AS user_name, u.id AS user_id
        FROM partners p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.id DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching partners:", err);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  },

  // ==========================================================
  // ✅ Add new partner (fixed version)
  // ==========================================================
  async addPartner(req, res) {
    try {
      const {
        company_name,
        slug,
        primary_color,
        secondary_color,
        accent_color,
        credits,
        user_id,
        logo_url,
        booking_link,
      } = req.body;
      const db = getDB();
      await db.query(
        `INSERT INTO partners 
          (company_name, slug, primary_color, secondary_color, accent_color, credits, user_id, logo_url, booking_link, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0)`,
        [
          company_name,
          slug,
          primary_color,
          secondary_color,
          accent_color,
          credits,
          user_id || null,
          logo_url || null,
          booking_link || null
        ]
      );
      // ✅ Log the action
      await logActivity({
        user_id: req.user.id,
        partner_id: null,
        action_type: "partner_add",
        description: `Partner "${company_name}" was added by admin.`,
        ip_address: req.ip,
      });
      res.json({ success: true, message: "Partner added successfully" });
    } catch (err) {
      console.error("❌ Error adding partner:", err);
      res.status(500).json({ error: "Failed to add partner" });
    }
  },

  // ==========================================================
  // ✅ Update partner
  // ==========================================================
  async updatePartner(req, res) {
    try {
      const { id } = req.params;
      const {
        company_name,
        slug,
        primary_color,
        secondary_color,
        accent_color,
        credits,
        user_id,
        logo_url,
        booking_link
      } = req.body;
      const db = getDB();
      await db.query(
        `UPDATE partners 
         SET company_name=?, slug=?, primary_color=?, secondary_color=?, accent_color=?, credits=?, user_id=?, logo_url=?, booking_link=?, updated_at=NOW()
         WHERE id=?`,
        [
          company_name,
          slug,
          primary_color,
          secondary_color,
          accent_color,
          credits,
          user_id || null,
          logo_url || null,
          booking_link || null,
          id
        ]
      );
      // ✅ Log update
      await logActivity({
        user_id: req.user.id,
        partner_id: id || null,
        action_type: "partner_update",
        description: `Partner "${company_name}" was updated by admin.`,
        ip_address: req.ip,
      });
      res.json({ success: true, message: "Partner updated successfully" });
    } catch (err) {
      console.error("❌ Error updating partner:", err);
      res.status(500).json({ error: "Failed to update partner" });
    }
  },

  // ==========================================================
  // ✅ Soft Delete Partner
  // ==========================================================
  async softDeletePartner(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      await db.query("UPDATE partners SET is_deleted = 1, updated_at = NOW() WHERE id = ?", [id]);
      await logActivity({
        user_id: req.user.id || null,
        partner_id: id || null,
        action_type: "partner_delete",
        description: `Partner ID ${id} was moved to trash by admin.`,
        ip_address: req.ip,
      });
      res.json({ success: true, message: "Partner moved to trash" });
    } catch (err) {
      console.error("❌ Error deleting partner:", err);
      res.status(500).json({ error: "Failed to delete partner" });
    }
  },

  // ==========================================================
  // ✅ Restore Partner
  // ==========================================================
  async restorePartner(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      await db.query("UPDATE partners SET is_deleted = 0, updated_at = NOW() WHERE id = ?", [id]);
      await logActivity({
        user_id: req.user.id,
        partner_id: id,
        action_type: "partner_restore",
        description: `Partner ID ${id} was restored by admin.`,
        ip_address: req.ip,
      });
      res.json({ success: true, message: "Partner restored successfully" });
    } catch (err) {
      console.error("❌ Error restoring partner:", err);
      res.status(500).json({ error: "Failed to restore partner" });
    }
  },
}