import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super_secret_jwt_key";

export const signToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
