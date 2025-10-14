import mysql from "mysql2/promise";

let pool;

export async function initDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "seo_mojo_db",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      // ✅ Important additions for MySQL 8+ / 9+
      multipleStatements: false,
      supportBigNumbers: true,
      bigNumberStrings: true,
      namedPlaceholders: true,
      timezone: "Z",
      decimalNumbers: true,
      dateStrings: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // ✅ Optional: helpful logs
    pool.on("connection", () => console.log("🔗 New DB connection established"));
    pool.on("error", (err) => console.error("💥 MySQL pool error:", err));

    console.log("✅ MySQL pool initialized successfully");
  } catch (err) {
    console.error("❌ MySQL pool initialization failed:", err.message);
    console.error("Details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      db: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
    pool = null;
  }
}

export function getDB() {
  if (!pool) throw new Error("❌ Database not initialized. Call initDB() first.");
  return pool;
}

// ✅ Clean shutdown
process.on("SIGINT", async () => {
  if (pool) {
    await pool.end();
    console.log("🧹 MySQL pool closed gracefully");
  }
  process.exit(0);
});
