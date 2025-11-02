import rateLimit, { MemoryStore } from "express-rate-limit";

const createLimiter = () =>
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    store: new MemoryStore(),
    handler: (req, res) =>
      res.status(429).json({
        success: false,
        message:
          "You’ve reached your free scan limit — 1 SEO audit per day. Please try again tomorrow or contact us if you’d like to unlock more scans.",
      }),
  });

export const limiterStore = {
  auditLimiter: createLimiter(),
  createLimiter,
};