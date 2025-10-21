import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";

// ✅ Protect middleware
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const db = getDB();
      const [rows] = await db.query(
        "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
        [decoded.id]
      );

      if (!rows.length) {
        return res.status(401).json({ error: "User not found" });
      }

      // 🧠 Merge DB info + decoded token
      const user = rows[0];

      // Fetch partner_id if user is a partner
      let partner_id = decoded.partner_id || null;
      if (user.role === "partner" && !partner_id) {
        const [partnerRows] = await db.query(
          "SELECT id AS partner_id FROM partners WHERE user_id = ? LIMIT 1",
          [user.id]
        );
        partner_id = partnerRows[0]?.partner_id || null;
      }

      // Attach to request
      req.user = {
        ...user,
        partner_id, // ✅ make sure partner_id is always available
      };

      next();

    } catch (err) {
      console.error("❌ Auth Error:", err);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};

// ✅ Role-based middleware
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied: Insufficient permissions" });
    }

    next();
  };
};
