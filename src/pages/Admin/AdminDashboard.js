import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ partners: 0, leads: 0, users: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [insights, setInsights] = useState({
    serverStatus: "Operational",
    recentLogins: 0,
    auditReports: 0,
    leadsThisMonth: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch admin stats:", err);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load activity");
        const data = await res.json();
        setRecentActivity(data);
      } catch (err) {
        console.error("❌ Failed to fetch activity:", err);
        // fallback to sample data for dev
        setRecentActivity([
          {
            id: 1,
            type: "user",
            description: "New admin user added: John Doe",
            time: "2 hours ago",
          },
          {
            id: 2,
            type: "partner",
            description: "Partner 'Bayside Pavers' updated company logo",
            time: "5 hours ago",
          },
          {
            id: 3,
            type: "lead",
            description: "New SEO Audit lead captured from Acme Inc.",
            time: "6 hours ago",
          },
          {
            id: 4,
            type: "system",
            description: "Scheduled backup completed successfully",
            time: "Yesterday",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchInsights = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/system/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error("❌ Failed to fetch system insights:", err);
      }
    };

    fetchStats();
    fetchActivity();
    fetchInsights();
  }, [API_URL]);

  return (
    <div className="main-layout">
      <div className="admin-dashboard">
        {/* ===== Header ===== */}
        <header className="dashboard-header">
          <h1 className="title">👋 Welcome back, Admin</h1>
          <p className="subtitle">
            Here’s an overview of platform performance and recent activity.
          </p>
        </header>

        {/* ===== KPI Row ===== */}
        <section className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">Users</div>
            <div className="kpi-value">
              {loading ? "..." : stats.users.toLocaleString()}
            </div>
            <span className="kpi-sub">Active platform members</span>
          </div>
          <div className="kpi">
            <div className="kpi-label">Partners</div>
            <div className="kpi-value">
              {loading ? "..." : stats.partners.toLocaleString()}
            </div>
            <span className="kpi-sub">White-label clients onboarded</span>
          </div>
          <div className="kpi">
            <div className="kpi-label">Leads</div>
            <div className="kpi-value">
              {loading ? "..." : stats.leads.toLocaleString()}
            </div>
            <span className="kpi-sub">SEO audits captured</span>
          </div>
        </section>

        {/* ===== Management ===== */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Management</h2>
            <p>Navigate to different administrative modules.</p>
          </div>

          <div className="section-links">
            <Link to="/admin-users" className="link-item flat">
              <span className="link-icon">👥</span>
              <div>
                <h4>Users</h4>
                <p>Manage platform users and access roles.</p>
              </div>
            </Link>

            <Link to="/admin-partners" className="link-item flat">
              <span className="link-icon">🏢</span>
              <div>
                <h4>Partners</h4>
                <p>Oversee partner brands, logos, and colors.</p>
              </div>
            </Link>

            <Link to="/admin-leads" className="link-item flat">
              <span className="link-icon">📈</span>
              <div>
                <h4>Leads</h4>
                <p>Track and analyze captured SEO leads.</p>
              </div>
            </Link>

            <Link to="/admin-settings" className="link-item flat">
              <span className="link-icon">⚙️</span>
              <div>
                <h4>Settings</h4>
                <p>Adjust site preferences and system details.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ===== System Insights ===== */}
        <section className="admin-section">
          <div className="section-header">
            <h2>System Insights</h2>
            <p>Operational overview at a glance.</p>
          </div>

          <div className="insight-list">
            <div className="insight-line">
              <span className="insight-label">Server Status</span>
              <span className={`insight-value ${insights.serverStatus === "Operational" ? "success" : "warning"}`}>
                {insights.serverStatus}
              </span>
            </div>

            <div className="insight-line">
              <span className="insight-label">Recent Logins (24h)</span>
              <span className="insight-value">{insights.recentLogins} users</span>
            </div>

            <div className="insight-line">
              <span className="insight-label">Audit Reports (This Week)</span>
              <span className="insight-value">{insights.auditReports} generated</span>
            </div>

            <div className="insight-line">
              <span className="insight-label">Leads Captured (This Month)</span>
              <span className="insight-value">{insights.leadsThisMonth} new</span>
            </div>
          </div>

        </section>

        {/* ===== Recent Activity ===== */}
        <section className="admin-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <p>Monitor the latest actions happening across the platform.</p>
          </div>

          <ul className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((a) => (
                <li key={a.id} className={`activity-item type-${a.type}`}>
                  <div className="activity-icon">
                    {a.type === "user" && "👤"}
                    {a.type === "partner" && "🏢"}
                    {a.type === "lead" && "📈"}
                    {a.type === "system" && "⚙️"}
                  </div>
                  <div className="activity-content">
                    <p className="activity-desc">{a.description}</p>
                    <span className="activity-time">
                      {a.time ||
                        new Date(a.created_at).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li>No recent activity.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}