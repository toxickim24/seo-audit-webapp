import { useEffect, useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ partners: 0, leads: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  return (
    <div className="main-layout">
      <main className="main-container">
        <h1 className="title">Admin Dashboard</h1>
        <p className="subtitle">Welcome back, Administrator 👋</p>

        <section className="stats-grid">
          {["partners", "leads", "users"].map((key) => (
            <div key={key} className="stat-card">
              <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
              <p>{loading ? "..." : stats[key] || 0}</p>
            </div>
          ))}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="button-group">
            <button onClick={() => (window.location.href = "/admin-partners")}>
              Manage Partners
            </button>
            <button onClick={() => (window.location.href = "/admin-leads")}>
              View Leads
            </button>
            <button onClick={() => (window.location.href = "/admin-settings")}>
              Settings
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
