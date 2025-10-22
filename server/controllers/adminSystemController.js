import { getDB } from "../config/db.js";

export const getSystemInsights = async (req, res) => {
  try {
    const db = getDB();

    // ✅ Server always operational (can add uptime check later)
    const serverStatus = "Operational";

    // ✅ Recent logins (last 24 hours)
    const [loginRows] = await db.query(
      `SELECT COUNT(*) AS total FROM users WHERE last_login >= NOW() - INTERVAL 1 DAY`
    );
    const recentLogins = loginRows[0]?.total || 0;

    // ✅ Audit Reports (this week)
    const [auditRows] = await db.query(
      `SELECT COUNT(*) AS total FROM leads WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    const auditReports = auditRows[0]?.total || 0;

    // ✅ Leads captured (this month)
    const [leadRows] = await db.query(
      `SELECT COUNT(*) AS total FROM leads WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`
    );
    const leadsThisMonth = leadRows[0]?.total || 0;

    res.status(200).json({
      serverStatus,
      recentLogins,
      auditReports,
      leadsThisMonth,
    });
  } catch (err) {
    console.error("❌ Error fetching system insights:", err);
    res.status(500).json({ error: "Failed to fetch system insights" });
  }
};
