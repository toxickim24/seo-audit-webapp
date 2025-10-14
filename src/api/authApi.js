import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ✅ Create reusable Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: { "Content-Type": "application/json" },
});

// ✅ Centralized error handler
const handleError = (error) => {
  // Log for debugging
  console.error("❌ Auth API Error:", error.response || error.message);

  // Extract message safely
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again.";

  // Always throw consistent error object
  throw { error: message, status: error.response?.status || 500 };
};

// ✅ REGISTER
export const register = async (data) => {
  try {
    const res = await api.post("/register", data);
    return res.data; // returns { message, user, token }
  } catch (error) {
    handleError(error);
  }
};

// ✅ LOGIN
export const login = async (data) => {
  try {
    const res = await api.post("/login", data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ GET CURRENT USER
export const getMe = async (token) => {
  try {
    const res = await api.get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// ✅ LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("👋 Logged out successfully.");
};
