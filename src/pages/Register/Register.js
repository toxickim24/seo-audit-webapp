import { useState } from "react";
import { register } from "../../api/authApi";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await register(form);
      console.log("✅ Register Response:", res);

      const token = res?.token;
      const user = res?.user;

      if (!token || !user) {
        throw new Error("Missing token or user in response");
      }

      // ✅ Save token & user to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect after success
      window.location.href = "/partner-dashboard";
    } catch (err) {
      console.error("❌ Register Error:", err);

      // ✅ New simplified error handler
      if (err?.error) {
        setError(err.error);
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Registration failed, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>

          {error && <p className="error-text">{error}</p>}

          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <button disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
