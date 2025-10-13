import { getDB } from "../config/db.js";
import slugify from "slugify";

export const PartnerController = {
  // ============================================================
  // ✅ Get partner info for the logged-in user
  // ============================================================
  async getMyPartner(req, res) {
    try {
      const db = getDB();
      const [rows] = await db.query(
        `SELECT id, user_id, company_name, subdomain, slug, logo_url,
                primary_color, secondary_color, accent_color, created_at, updated_at
         FROM partners WHERE user_id = ? LIMIT 1`,
        [req.user.id]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Partner record not found for user" });
      }

      res.json({ message: "Partner data loaded", partner: rows[0] });
    } catch (err) {
      console.error("❌ [PartnerController.getMyPartner] Error:", err);
      res.status(500).json({ error: "Server error retrieving partner data" });
    }
  },

  // ============================================================
  // ✅ Create or Update Partner Info
  // ============================================================
  async updateOrCreate(req, res) {
    try {
      const db = getDB();
      const {
        company_name,
        slug,
        subdomain,
        logo_url,
        primary_color = "#FB6A45",
        secondary_color = "#FF8E3A",
        accent_color = "#22354D",
      } = req.body;

      if (!company_name) {
        return res.status(400).json({ error: "Company name is required" });
      }

      // ✅ Use user-entered slug if provided; fallback to company name
      const cleanSlug = slugify(slug || company_name, { lower: true, strict: true });

      // ✅ Check for slug conflict (same slug used by another user)
      const [conflict] = await db.query(
        "SELECT id FROM partners WHERE slug = ? AND user_id != ?",
        [cleanSlug, req.user.id]
      );

      let finalSlug = cleanSlug;
      if (conflict.length > 0) {
        // append a small numeric suffix instead of timestamp to avoid randomness
        const [similarSlugs] = await db.query(
          "SELECT slug FROM partners WHERE slug LIKE ?",
          [`${cleanSlug}%`]
        );
        const suffix = similarSlugs.length + 1;
        finalSlug = `${cleanSlug}-${suffix}`;
      }

      // ✅ Check if a partner record already exists
      const [existing] = await db.query(
        "SELECT id FROM partners WHERE user_id = ?",
        [req.user.id]
      );

      if (existing.length > 0) {
        // Update existing partner
        await db.query(
          `UPDATE partners
           SET company_name=?, subdomain=?, slug=?, logo_url=?,
               primary_color=?, secondary_color=?, accent_color=?, updated_at=NOW()
           WHERE user_id=?`,
          [
            company_name,
            subdomain || null,
            finalSlug,
            logo_url || null,
            primary_color,
            secondary_color,
            accent_color,
            req.user.id,
          ]
        );
      } else {
        // Create new partner
        await db.query(
          `INSERT INTO partners
           (user_id, company_name, subdomain, slug, logo_url,
            primary_color, secondary_color, accent_color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            company_name,
            subdomain || null,
            finalSlug,
            logo_url || null,
            primary_color,
            secondary_color,
            accent_color,
          ]
        );
      }

      // Return the updated partner info
      const [updated] = await db.query(
        `SELECT id, user_id, company_name, subdomain, slug, logo_url,
                primary_color, secondary_color, accent_color, updated_at
         FROM partners WHERE user_id = ?`,
        [req.user.id]
      );

      res.json({
        message: "✅ Partner info saved successfully",
        partner: updated[0],
      });
    } catch (err) {
      console.error("❌ [PartnerController.updateOrCreate] Error:", err);
      res.status(500).json({ error: "Server error saving partner info" });
    }
  },

  // ============================================================
  // ✅ Public Partner Page (by slug)
  // ============================================================
  async getBySlug(req, res) {
    try {
      const db = getDB();
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: "Slug parameter missing" });
      }

      const [rows] = await db.query(
        `SELECT id, company_name, slug, logo_url,
                primary_color, secondary_color, accent_color
         FROM partners WHERE slug = ? LIMIT 1`,
        [slug]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Partner not found" });
      }

      res.json({
        message: "✅ Partner data retrieved successfully",
        partner: rows[0],
      });
    } catch (err) {
      console.error("❌ [PartnerController.getBySlug] Error:", err);
      res.status(500).json({ error: "Server error fetching partner data" });
    }
  },
};
