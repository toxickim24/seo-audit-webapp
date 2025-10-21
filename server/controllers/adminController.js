import { getDB } from "../config/db.js";
import { logActivity } from "../utils/logActivity.js";

export const AdminController = {

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

      await logActivity({
        user_id: req.user.id || null,
        action_type: "system_update",
        description: "Admin updated system settings (site name, colors, or email)",
        ip_address: req.ip,
      });

      res.json({ message: "Settings updated successfully" });
    } catch (err) {
      console.error("❌ Error updating settings:", err);
      res.status(500).json({ error: "Failed to save settings" });
    }
  },

  async getStats(req, res) {
    try {
      const db = getDB();

      const [[partners]] = await db.query("SELECT COUNT(*) AS total FROM partners");
      const [[leads]] = await db.query("SELECT COUNT(*) AS total FROM leads");
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
