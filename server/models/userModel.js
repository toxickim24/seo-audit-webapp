import { getDB } from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id, name, email, password, role, is_deleted FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id, name, email, role, is_deleted FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },
};
