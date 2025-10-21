import { getDB } from "../config/db.js";
import { logActivity } from "../utils/logActivity.js";

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
    const [rows] = await db.execute(
      `SELECT * 
       FROM leads 
       WHERE (partner_id IS NULL OR partner_id = 0)
       ORDER BY date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching leads:", err.message);
    res.status(500).json({ error: "Server error fetching leads" });
  }
}

export async function addLead(req, res) {
  const db = getDB();
  const { name, phone, company, email, website, score, partner_id } = req.body;

  if (!email || !name) {
    console.log("⚠️ Missing name/email");
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO leads 
       (partner_id, name, phone, company, email, website, score, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        partner_id || null,
        name,
        phone || "",
        company || "",
        email,
        website || "",
        score || 0,
      ]
    );

    await logActivity({
      user_id: req.user?.id || null,
      partner_id: partner_id || null,
      action_type: "lead_add",
      description: `Lead added: ${name} (${email})`,
      ip_address: req.ip,
    });

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

export async function deleteLead(req, res) {
  const db = getDB();
  const { id } = req.params;

  try {
    await db.execute("DELETE FROM leads WHERE id = ?", [id]);
    await logActivity({
      user_id: req.user.id || null,
      action_type: "lead_delete",
      description: `Lead ID ${id} was permanently deleted by admin.`,
      ip_address: req.ip,
    });
    res.json({ success: true, message: "Lead permanently deleted" });
  } catch (err) {
    console.error("❌ Error deleting lead:", err);
    res.status(500).json({ error: "Server error deleting lead" });
  }
}
