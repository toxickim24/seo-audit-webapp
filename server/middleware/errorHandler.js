export function errorHandler(err, req, res, next) {
  console.error("❌ Global Error:", err.stack || err.message);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}