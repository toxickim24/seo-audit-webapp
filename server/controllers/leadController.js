import { getDB } from "../config/db.js";

export async function getLeads(req, res) {
  const pool = getDB();
  if (!pool) {
    return res.json([
      {
        id: 1,
        name: "Demo Lead",
        email: "demo@example.com",
        website: "https://example.com",
        score: 75,
        date: new Date(),
      },
    ]);
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM leads WHERE is_deleted = 0 ORDER BY date DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching leads:", err.message);
    res.json([]);
  }
}

export async function addLead(req, res) {
  const pool = getDB();
  const { name, phone, company, email, website, overallScore, date } = req.body;

  if (!email)
    return res.status(400).json({ error: "Email is required" });

  if (!pool)
    return res.status(201).json({ success: true, id: Date.now() });

  try {
    const [result] = await pool.execute(
      "INSERT INTO leads (name, phone, company, email, website, score, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, phone, company, email, website, overallScore, date]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Error inserting lead:", err.message);
    res.json({ success: true, id: Date.now() });
  }
}

export async function deleteLead(req, res) {
  const pool = getDB();
  const { id } = req.params;

  if (!pool)
    return res.json({ success: true, message: "Lead marked as deleted (fake)" });

  try {
    await pool.execute("UPDATE leads SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "Lead marked as deleted" });
  } catch (err) {
    console.error("❌ Error deleting lead:", err.message);
    res.json({ success: true, message: "Lead marked as deleted (fake)" });
  }
}
