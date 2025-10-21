import { getDB } from "../config/db.js";
import { logActivity } from "../utils/logActivity.js";

export const PartnerLeadController = {
  async getMyLeads(req, res) {
    try {
      const db = getDB();

      // ✅ Strictly enforce partner role
      if (!req.user || !req.user.partner_id) {
        return res.status(403).json({ error: "Access denied: Partner account required" });
      }

      const partnerId = req.user.partner_id;

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
      const { name, email, phone, company, website, score, partner_id } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      if (!partner_id) {
        return res.status(400).json({ error: "Missing partner ID — invalid submission" });
      }

      const db = getDB();

      const [result] = await db.query(
        `INSERT INTO leads (partner_id, name, email, phone, company, website, score, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [partner_id, name, email, phone || "", company || "", website || "", score || null]
      );

      // ✅ Optional logging
      try {
        await logActivity({
          user_id: null, // public, no login
          partner_id,
          action_type: "lead_add",
          description: `New public lead added: ${name} (${email})`,
          ip_address: req.ip,
        });
      } catch (logErr) {
        console.warn("⚠️ Could not log public lead:", logErr.message);
      }

      res.status(201).json({
        success: true,
        message: "Lead added successfully",
        id: result.insertId,
      });
    } catch (err) {
      console.error("❌ Error adding public lead:", err);
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

      await logActivity({
        user_id: req.user.id || null,
        partner_id: partnerId || null,
        action_type: "lead_delete",
        description: `Partner deleted lead ID ${id}`,
        ip_address: req.ip,
      });

      res.status(200).json({ message: "Lead permanently deleted" });
    } catch (err) {
      console.error("❌ Error deleting lead:", err);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  },
};
