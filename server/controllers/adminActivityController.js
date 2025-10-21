import { getDB } from "../config/db.js";

export const addActivity = async (req, res) => {
  try {
    const { action_type, description, partner_id } = req.body;
    const db = getDB();

    await db.query(
      `INSERT INTO activity_logs (user_id, partner_id, action_type, description, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, partner_id || null, action_type, description, req.ip]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error adding activity:", err);
    res.status(500).json({ error: "Failed to add activity log" });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT a.*, u.name AS user_name, p.company_name
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN partners p ON a.partner_id = p.id
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    const simplified = rows.map((a) => ({
      ...a,
      type: a.action_type.split("_")[0] || "system", // normalize type
    }));
    
    res.status(200).json(simplified);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ error: "Failed to fetch recent activities" });
  }
};
