// controllers/partnerController.js
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
         FROM partners
         WHERE user_id = ? LIMIT 1`,
        [req.user.id]
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ error: "No partner record found for this user." });
      }

      return res.json({
        message: "✅ Partner data loaded successfully.",
        partner: rows[0],
      });
    } catch (err) {
      console.error("❌ [PartnerController.getMyPartner] Error:", err);
      return res
        .status(500)
        .json({ error: "Server error retrieving partner data." });
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
        primary_color,
        secondary_color,
        accent_color,
      } = req.body;

      if (!company_name) {
        return res.status(400).json({ error: "Company name is required." });
      }

      // ✅ Determine base slug (user-entered or from company name)
      const cleanSlug = slugify(slug || company_name, {
        lower: true,
        strict: true,
      });

      // ✅ Check for slug conflict (belongs to another user)
      const [conflicts] = await db.query(
        "SELECT id FROM partners WHERE slug = ? AND user_id != ?",
        [cleanSlug, req.user.id]
      );

      let finalSlug = cleanSlug;
      if (conflicts.length > 0) {
        // generate suffix to avoid collision
        const [similarSlugs] = await db.query(
          "SELECT slug FROM partners WHERE slug LIKE ?",
          [`${cleanSlug}%`]
        );
        finalSlug = `${cleanSlug}-${similarSlugs.length + 1}`;
      }

      // ✅ Check if partner exists for this user
      const [existing] = await db.query(
        "SELECT id FROM partners WHERE user_id = ?",
        [req.user.id]
      );

      if (existing.length > 0) {
        // 🔄 Update partner record
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
            primary_color || null,
            secondary_color || null,
            accent_color || null,
            req.user.id,
          ]
        );
      } else {
        // 🆕 Create partner record (colors can be null)
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
            primary_color || null,
            secondary_color || null,
            accent_color || null,
          ]
        );
      }

      // ✅ Return updated partner info
      const [updated] = await db.query(
        `SELECT id, user_id, company_name, subdomain, slug, logo_url,
                primary_color, secondary_color, accent_color, updated_at
         FROM partners
         WHERE user_id = ? LIMIT 1`,
        [req.user.id]
      );

      return res.json({
        message: "✅ Partner info saved successfully.",
        partner: updated[0],
      });
    } catch (err) {
      console.error("❌ [PartnerController.updateOrCreate] Error:", err);
      return res.status(500).json({ error: "Server error saving partner info." });
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
        return res.status(400).json({ error: "Slug parameter missing." });
      }

      const [rows] = await db.query(
        `SELECT id, company_name, slug, logo_url,
                primary_color, secondary_color, accent_color
         FROM partners
         WHERE slug = ? LIMIT 1`,
        [slug]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Partner not found." });
      }

      // ✅ Return clean, frontend-friendly response
      return res.json(rows[0]);
    } catch (err) {
      console.error("❌ [PartnerController.getBySlug] Error:", err);
      return res
        .status(500)
        .json({ error: "Server error fetching partner data." });
    }
  },
};
