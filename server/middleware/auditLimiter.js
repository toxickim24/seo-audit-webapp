import rateLimit, { MemoryStore } from "express-rate-limit";

// ✅ Export the same memory store so limits persist while server runs
export const memoryStore = new MemoryStore();

export const auditLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // allow 3 requests per IP per day (adjust as needed)
  standardHeaders: true,
  legacyHeaders: false,
  store: memoryStore,

  // ✅ Custom response to prevent unhandled errors in browser console
  handler: (req, res /*, next */) => {
    res.status(429).json({
      success: false,
      message:
        "Free scan limit reached. Please try again later or contact support.",
    });
  },
});