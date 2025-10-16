import { useState } from "react";
import { login } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
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
      setError(
        err?.response?.data?.error ||
          err?.error ||
          err?.message ||
          "Login failed, please try again."
      );
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
