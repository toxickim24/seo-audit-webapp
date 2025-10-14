import { getDB } from "../config/db.js";

// ✅ Get all global leads (exclude partner-owned)
export async function getLeads(req, res) {
  const db = getDB();

  if (!db) {
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
    // ✅ Only return leads not assigned to any partner
    const [rows] = await db.execute(
      `SELECT * 
       FROM leads 
       WHERE (partner_id IS NULL OR partner_id = 0) 
         AND is_deleted = 0 
       ORDER BY date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching leads:", err.message);
    res.status(500).json({ error: "Server error fetching leads" });
  }
}

// ✅ Add new lead (works for both global + partner leads)
export async function addLead(req, res) {
  console.log("📩 Incoming Lead:", req.body);
  const db = getDB();
  const { name, phone, company, email, website, overallScore, partner_id } = req.body;

  if (!email || !name) {
    console.log("⚠️ Missing name/email");
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO leads 
       (partner_id, name, phone, company, email, website, score, date, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
      [
        partner_id || null, // ✅ auto-fallback to NULL if not a partner link
        name,
        phone || "",
        company || "",
        email,
        website || "",
        overallScore || 0,
      ]
    );

    console.log(
      `✅ Lead inserted (ID: ${result.insertId}) ${
        partner_id ? `for Partner ID: ${partner_id}` : "(Global Lead)"
      }`
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ addLead SQL error:", err);
    res.status(500).json({ error: err.message });
  }
}

// ✅ Soft delete a lead
export async function deleteLead(req, res) {
  const db = getDB();
  const { id } = req.params;

  if (!db) {
    return res.json({ success: true, message: "Lead marked as deleted (mock)" });
  }

  try {
    await db.execute("UPDATE leads SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting lead:", err);
    res.status(500).json({ error: "Server error deleting lead" });
  }
}
