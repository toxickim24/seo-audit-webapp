import { useState } from "react";
import { login } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAlert } from "../../utils/useAlert";

export default function Login() {
  const { success, error: alertError, confirm } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (!res || !res.token || !res.user) {
        throw new Error("Unexpected server response");
      }

      // ✅ Block login if account deleted
      if (res.user.is_deleted === 1) {
        alertError("Your account has been deleted. Please contact the administrator.");
        setLoading(false);
        return;
      }

      success("Login successful!");

      // ✅ Save auth data
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("userRole", res.user.role);
      window.dispatchEvent(new Event("authChange"));

      // ✅ Redirect by role
      if (res.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/partner-dashboard", { replace: true });
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      const message =
        err?.response?.data?.error ||
        err?.error ||
        err?.message ||
        "Login failed, please try again.";

      setError(message);
      alertError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Login</h2>

          {error && <p className="error-text">{error}</p>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}
