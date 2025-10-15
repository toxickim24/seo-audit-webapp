import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../../api/authApi";

function ProtectedRoute({ children }) {
  const [verified, setVerified] = useState(false);
  const [checked, setChecked] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setChecked(true);
      setVerified(false);
      return;
    }

    getMe(token)
      .then(() => {
        setVerified(true);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setVerified(false);
        setChecked(true);
      });
  }, [token]);

  if (!checked) return null;
  if (!verified) return <Navigate to="/partner-login" replace />;

  return children;
}

export default ProtectedRoute;
