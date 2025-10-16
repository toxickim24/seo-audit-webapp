import { getDB } from "../config/db.js";

export const AdminController = {
  async getAllPartners(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(
        "SELECT id, company_name, slug, primary_color FROM partners ORDER BY id DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching partners:", err);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  },

  async addPartner(req, res) {
    try {
      const { company_name, slug, primary_color } = req.body;
      const db = getDB();
      await db.query(
        "INSERT INTO partners (company_name, slug, primary_color, created_at) VALUES (?, ?, ?, NOW())",
        [company_name, slug, primary_color]
      );
      res.json({ message: "Partner added successfully" });
    } catch (err) {
      console.error("❌ Error adding partner:", err);
      res.status(500).json({ error: "Failed to add partner" });
    }
  },

  async updatePartner(req, res) {
    try {
      const { id } = req.params;
      const { company_name, slug, primary_color } = req.body;
      const db = getDB();
      await db.query(
        "UPDATE partners SET company_name=?, slug=?, primary_color=?, updated_at=NOW() WHERE id=?",
        [company_name, slug, primary_color, id]
      );
      res.json({ message: "Partner updated successfully" });
    } catch (err) {
      console.error("❌ Error updating partner:", err);
      res.status(500).json({ error: "Failed to update partner" });
    }
  },

  async deletePartner(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      await db.query("DELETE FROM partners WHERE id = ?", [id]);
      res.json({ message: "Partner deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting partner:", err);
      res.status(500).json({ error: "Failed to delete partner" });
    }
  },

  // ✅ Fetch global settings
  async getSettings(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query("SELECT * FROM settings LIMIT 1");
      if (!rows.length) {
        return res.json({
          site_name: "SEO Audit App",
          contact_email: "",
          primary_color: "#1a273b",
        });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  },

  // ✅ Update global settings
  async updateSettings(req, res) {
    try {
      const { site_name, contact_email, primary_color } = req.body;
      const db = getDB();

      await db.query(
        `INSERT INTO settings (id, site_name, contact_email, primary_color)
         VALUES (1, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         site_name = VALUES(site_name),
         contact_email = VALUES(contact_email),
         primary_color = VALUES(primary_color)`,
        [site_name, contact_email, primary_color]
      );

      res.json({ message: "Settings updated successfully" });
    } catch (err) {
      console.error("❌ Error updating settings:", err);
      res.status(500).json({ error: "Failed to save settings" });
    }
  },

  // ✅ Get overall stats for Admin Dashboard
  async getStats(req, res) {
    try {
      const db = getDB();

      const [[partners]] = await db.query("SELECT COUNT(*) AS total FROM partners");
      const [[leads]] = await db.query("SELECT COUNT(*) AS total FROM leads WHERE is_deleted = 0");
      const [[users]] = await db.query("SELECT COUNT(*) AS total FROM users");

      res.json({
        partners: partners.total || 0,
        leads: leads.total || 0,
        users: users.total || 0,
      });
    } catch (err) {
      console.error("❌ Error fetching admin stats:", err);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  },
};
