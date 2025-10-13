import { getDB } from "../config/db.js";

export const UserModel = {
  async create({ name, email, password }) {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  async findById(id) {
    const db = getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },
};
