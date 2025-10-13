import bcrypt from "bcryptjs";
import slugify from "slugify";
import { getDB } from "../config/db.js";
import { UserModel } from "../models/userModel.js";
import { signToken } from "../utils/jwt.js";

export const AuthController = {
  // ============================================================
  // ✅ REGISTER
  // ============================================================
  async register(req, res) {
    const db = getDB();
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const { name, email, password, company_name } = req.body;

      // 🔍 Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 🔍 Check existing email
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // 🔐 Hash password
      const hashed = await bcrypt.hash(password, 10);

      // 👤 Insert user record
      const [userRes] = await conn.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashed]
      );
      const userId = userRes.insertId;

      // 🏢 Create partner if company name provided
      let partnerSlug = null;
      if (company_name) {
        const baseSlug =
          slugify(company_name, { lower: true, strict: true }) ||
          `company-${userId}`;
        let slug = baseSlug;

        // ✅ Ensure unique slug
        const [conflicts] = await conn.query(
          "SELECT slug FROM partners WHERE slug = ?",
          [slug]
        );
        if (conflicts.length > 0) {
          slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 💾 Insert partner record
        await conn.query(
          `INSERT INTO partners 
           (user_id, company_name, slug, primary_color, secondary_color, accent_color)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, company_name, slug, "#FB6A45", "#FF8E3A", "#22354D"]
        );

        partnerSlug = slug;
      }

      // ✅ Commit transaction
      await conn.commit();

      // 🔑 Create token
      const token = signToken({ id: userId, email });

      // 📨 Return success
      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: userId,
          name,
          email,
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
  // ✅ LOGIN (with Partner Info)
  // ============================================================
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const db = getDB();

      // 🔍 Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // 🔐 Compare password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // 🏢 Fetch partner info
      const [partnerRows] = await db.query(
        "SELECT company_name, slug FROM partners WHERE user_id = ? LIMIT 1",
        [user.id]
      );
      const partner = partnerRows[0] || {};

      // 🔑 Create token
      const token = signToken({ id: user.id, email: user.email });

      // ✅ Respond with enriched user
      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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
  // ✅ GET CURRENT USER
  // ============================================================
  async me(req, res) {
    try {
      const db = getDB();

      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // include partner info for /api/me
      const [partnerRows] = await db.query(
        "SELECT company_name, slug FROM partners WHERE user_id = ? LIMIT 1",
        [req.user.id]
      );

      const partner = partnerRows[0] || {};

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        company_name: partner.company_name || null,
        slug: partner.slug || null,
      });
    } catch (err) {
      console.error("❌ Me Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};
