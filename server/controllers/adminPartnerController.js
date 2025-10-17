import { getDB } from "../config/db.js";

export const AdminPartnerController = {
  // ==========================================================
  // ✅ Get all partners
  // ==========================================================
  async getAllPartners(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(`
        SELECT p.id, p.company_name, p.slug, p.logo_url, 
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
  // ✅ Add new partner (default 3 credits)
  // ==========================================================
  async addPartner(req, res) {
    try {
      const {
        company_name,
        slug,
        primary_color,
        secondary_color,
        accent_color,
        user_id,
        logo_url,
      } = req.body;
      const db = getDB();
      await db.query(
        `INSERT INTO partners 
         (company_name, slug, primary_color, secondary_color, accent_color, credits, user_id, logo_url, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, 3, ?, ?, NOW(), NOW(), 0)`,
        [
          company_name,
          slug,
          primary_color,
          secondary_color,
          accent_color,
          req.body.credits || 3,
          user_id || null,
          logo_url || null,
        ]
      );
      res.json({ success: true, message: "Partner added successfully with 3 credits" });
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
      } = req.body;
      const db = getDB();
      await db.query(
        `UPDATE partners 
         SET company_name=?, slug=?, primary_color=?, secondary_color=?, accent_color=?, credits=?, user_id=?, logo_url=?, updated_at=NOW()
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
          id,
        ]
      );
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
      res.json({ success: true, message: "Partner restored successfully" });
    } catch (err) {
      console.error("❌ Error restoring partner:", err);
      res.status(500).json({ error: "Failed to restore partner" });
    }
  },
}