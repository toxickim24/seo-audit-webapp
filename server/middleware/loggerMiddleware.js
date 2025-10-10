export function logger(req, res, next) {
  const time = new Date().toISOString();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(`[${time}] ${req.method} ${req.originalUrl} — IP: ${ip}`);
  next();
}