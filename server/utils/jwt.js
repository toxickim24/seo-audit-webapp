import jwt from "jsonwebtoken";

// Read at call time, not at module-load time, so dotenv has already run
export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};
