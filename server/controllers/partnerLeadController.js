import { getDB } from "../config/db.js";

export const PartnerLeadController = {
  async getMyLeads(req, res) {
    try {
      const db = getDB();
      const partnerId = req.user.partner_id || req.user.id;

      console.log("🔍 Fetching leads for partner ID:", partnerId);

      const [rows] = await db.query(
        `SELECT id, name, email, phone, company, website, score, date
         FROM leads
         WHERE partner_id = ?
         ORDER BY date DESC`,
        [partnerId]
      );

      res.status(200).json(rows);
    } catch (err) {
      console.error("❌ Error fetching partner leads:", err);
      res.status(500).json({ error: "Failed to fetch partner leads" });
    }
  },

  async addLead(req, res) {
    try {
      const { name, email, phone, company, website, score } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const db = getDB();
      const partnerId = req.user.partner_id || req.user.id;

      console.log("🆕 Adding lead for partner ID:", partnerId, req.body);

      const [result] = await db.query(
        `INSERT INTO leads (partner_id, name, email, phone, company, website, score)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [partnerId, name, email, phone || "", company || "", website || "", score || null]
      );

      res
        .status(201)
        .json({ message: "Lead added successfully", id: result.insertId });
    } catch (err) {
      console.error("❌ Error adding lead:", err);
      res.status(500).json({ error: "Failed to add lead" });
    }
  },

  async deleteLead(req, res) {
    try {
      const { id } = req.params;
      const db = getDB();
      const partnerId = req.user.partner_id || req.user.id;

      const [result] = await db.query(
        `DELETE FROM leads WHERE id = ? AND partner_id = ?`,
        [id, partnerId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Lead not found or not associated with your account" });
      }

      res.status(200).json({ message: "Lead permanently deleted" });
    } catch (err) {
      console.error("❌ Error deleting lead:", err);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  },
};
