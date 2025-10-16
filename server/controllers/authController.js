import bcrypt from "bcryptjs";
import slugify from "slugify";
import { getDB } from "../config/db.js";
import { UserModel } from "../models/userModel.js";
import { signToken } from "../utils/jwt.js";

export const AuthController = {
  // ============================================================
  // ✅ REGISTER (defaults to "partner" role)
  // ============================================================
  async register(req, res) {
    const db = getDB();
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const { name, email, password, company_name } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);

      // 👤 Insert user (default role = partner)
      const [userRes] = await conn.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashed, "partner"]
      );
      const userId = userRes.insertId;

      // 🏢 Create partner if company_name provided
      let partnerSlug = null;
      if (company_name) {
        const baseSlug =
          slugify(company_name, { lower: true, strict: true }) ||
          `company-${userId}`;
        let slug = baseSlug;

        const [conflicts] = await conn.query(
          "SELECT slug FROM partners WHERE slug = ?",
          [slug]
        );
        if (conflicts.length > 0) {
          slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        await conn.query(
          `INSERT INTO partners 
           (user_id, company_name, slug, primary_color, secondary_color, accent_color)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, company_name, slug, null, null, null]
        );
        partnerSlug = slug;
      }

      await conn.commit();

      const token = signToken({ id: userId, email, role: "partner" });

      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: userId,
          name,
          email,
          role: "partner",
          company_name: company_name || null,
          slug: partnerSlug,
        },
        token,
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Register Error:", err);
      res.status(500).json({ error: "Server error during registration" });
    } finally {
      conn.release();
    }
  },

  // ============================================================
  // ✅ LOGIN (works for both Partner + Admin)
  // ============================================================
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const db = getDB();

      const user = await UserModel.findByEmail(email);
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: "Invalid credentials" });

      // 🏢 Partner info (if applicable)
      const [partnerRows] = await db.query(
        "SELECT company_name, slug FROM partners WHERE user_id = ? LIMIT 1",
        [user.id]
      );
      const partner = partnerRows[0] || {};

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_name: partner.company_name || null,
          slug: partner.slug || null,
        },
      });
    } catch (err) {
      console.error("❌ Login Error:", err);
      res.status(500).json({ error: "Server error during login" });
    }
  },

  // ============================================================
  // ✅ CURRENT USER
  // ============================================================
  async me(req, res) {
    try {
      const db = getDB();
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const [partnerRows] = await db.query(
        "SELECT company_name, slug FROM partners WHERE user_id = ? LIMIT 1",
        [req.user.id]
      );
      const partner = partnerRows[0] || {};

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_name: partner.company_name || null,
        slug: partner.slug || null,
      });
    } catch (err) {
      console.error("❌ Me Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};
