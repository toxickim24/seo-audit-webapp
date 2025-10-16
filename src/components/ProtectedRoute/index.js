import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../../api/authApi";

/**
 * ✅ Role-based route protection
 * @param {ReactNode} children - The component to render when authorized
 * @param {string} requiredRole - Optional role restriction ("admin" or "partner")
 */
function ProtectedRoute({ children, requiredRole }) {
  const [verified, setVerified] = useState(false);
  const [checked, setChecked] = useState(false);
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token) {
      setChecked(true);
      setVerified(false);
      return;
    }

    getMe(token)
      .then((res) => {
        if (res?.data?.role) {
          localStorage.setItem("userRole", res.data.role);
        }
        setVerified(true);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setVerified(false);
        setChecked(true);
      });
  }, [token]);

  if (!checked) return null; // prevent flicker while checking

  // 🚫 No token or invalid token
  if (!verified) return <Navigate to="/partner-login" replace />;

  // 🔒 Role enforcement (admin or partner only)
  if (requiredRole && storedRole !== requiredRole) {
    // Admin trying to open partner route
    if (storedRole === "admin") return <Navigate to="/admin-dashboard" replace />;
    // Partner trying to open admin route
    if (storedRole === "partner") return <Navigate to="/partner-dashboard" replace />;
    // Default fallback
    return <Navigate to="/" replace />;
  }

  // ✅ All checks passed
  return children;
}

export default ProtectedRoute;
