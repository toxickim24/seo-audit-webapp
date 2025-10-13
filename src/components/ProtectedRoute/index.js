import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../../api/authApi";

function ProtectedRoute({ children }) {
  const [verified, setVerified] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setVerified(false);
      return;
    }

    getMe(token)
      .then(() => setVerified(true))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setVerified(false);
      });
  }, [token]);

  if (verified === null) return <p>Loading...</p>;
  if (!verified) return <Navigate to="/partner-login" replace />;

  return children;
}

export default ProtectedRoute;
