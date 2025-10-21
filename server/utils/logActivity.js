import { getDB } from "../config/db.js";

/**
 * Logs an activity event to the database.
 * @param {Object} options
 * @param {number|null} options.user_id - ID of the user performing the action
 * @param {number|null} options.partner_id - Optional related partner ID
 * @param {string} options.action_type - Machine-friendly name (e.g. 'user_add')
 * @param {string} options.description - Human-readable description
 * @param {string} [options.ip_address] - Optional IP address
 */
export async function logActivity({
  user_id = null,
  partner_id = null,
  action_type,
  description,
  ip_address = null,
}) {
  try {
    const db = getDB();
    await db.query(
      `INSERT INTO activity_logs (user_id, partner_id, action_type, description, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, partner_id, action_type, description, ip_address]
    );
  } catch (err) {
    console.error("❌ Failed to log activity:", err);
  }
}