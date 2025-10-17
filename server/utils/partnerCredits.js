import { getDB } from "../config/db.js";

/**
 * Checks and deducts 1 credit from a partner.
 * Returns { allowed: boolean, remaining: number }
 */
export async function checkAndUsePartnerCredit(partnerId) {
  const db = getDB();

  // ✅ Fetch partner credits
  const [[partner]] = await db.query(
    "SELECT credits FROM partners WHERE id = ? LIMIT 1",
    [partnerId]
  );

  if (!partner) throw new Error("Partner not found");

  if (partner.credits <= 0) {
    return { allowed: false, remaining: 0 };
  }

  // ✅ Deduct 1 credit
  await db.query("UPDATE partners SET credits = credits - 1 WHERE id = ?", [
    partnerId,
  ]);

  return { allowed: true, remaining: partner.credits - 1 };
}