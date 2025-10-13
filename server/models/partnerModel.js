import { getDB } from "../config/db.js";

export const PartnerModel = {
  // ============================================================
  // ✅ Get partner record by user ID
  // ============================================================
  async findByUserId(userId) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM partners WHERE user_id = ?", [userId]);
    return rows[0] || null;
  },

  // ============================================================
  // ✅ Get partner record by slug (public route)
  // ============================================================
  async findBySlug(slug) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM partners WHERE slug = ?", [slug]);
    return rows[0] || null;
  },

  // ============================================================
  // ✅ Create a new partner record
  // ============================================================
  async create({
    user_id,
    company_name,
    subdomain = null,
    slug,
    logo_url = null,
    primary_color = "#FB6A45",
    secondary_color = "#FF8E3A",
    accent_color = "#22354D",
  }) {
    const db = getDB();

    const [result] = await db.query(
      `INSERT INTO partners 
       (user_id, company_name, subdomain, slug, logo_url, 
        primary_color, secondary_color, accent_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        company_name,
        subdomain,
        slug,
        logo_url,
        primary_color,
        secondary_color,
        accent_color,
      ]
    );

    const [rows] = await db.query("SELECT * FROM partners WHERE id = ?", [result.insertId]);
    return rows[0];
  },

  // ============================================================
  // ✅ Update existing partner
  // ============================================================
  async update(user_id, fields) {
    const db = getDB();

    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = Object.values(fields);
    values.push(user_id);

    await db.query(
      `UPDATE partners SET ${setClause}, updated_at = NOW() WHERE user_id = ?`,
      values
    );

    const [rows] = await db.query("SELECT * FROM partners WHERE user_id = ?", [user_id]);
    return rows[0];
  },

  // ============================================================
  // ✅ Update only colors (optional helper)
  // ============================================================
  async updateColors(user_id, { primary_color, secondary_color, accent_color }) {
    const db = getDB();
    await db.query(
      `UPDATE partners 
       SET primary_color = ?, secondary_color = ?, accent_color = ?, updated_at = NOW() 
       WHERE user_id = ?`,
      [primary_color, secondary_color, accent_color, user_id]
    );
    const [rows] = await db.query("SELECT * FROM partners WHERE user_id = ?", [user_id]);
    return rows[0];
  },
};
