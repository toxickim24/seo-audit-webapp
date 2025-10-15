import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PartnerDashboard.css";

function PartnerDashboard() {
  const [partner, setPartner] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("❌ Error parsing user data:", err);
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedUser = localStorage.getItem("user");
        setPartner(updatedUser ? JSON.parse(updatedUser) : null);
      } catch {
        setPartner(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!partner) {
    return (
      <div className="main-layout">
        <div className="partner-dashboard">
          <h2>Partner info not found</h2>
          <p>Please log in again to access your dashboard.</p>
          <Link to="/partner-login" className="menu-card">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const partnerLink = `${window.location.origin}/${partner?.slug || ""}`;

  return (
    <div className="main-layout">
      <div className="partner-dashboard">
        <header className="dashboard-header">
          <section className="welcome-section">
            <h1>
              Welcome, <span>{partner?.company_name || partner?.name}</span> 👋
            </h1>
            <p className="subtitle">
              This is your partner dashboard — manage your brand, track leads,
              and share your white-label SEO Audit page with clients.
            </p>
          </section>
        </header>

        <section className="link-card">
          <h3>Your Partner Link</h3>
          <a
            href={partnerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-link"
          >
            {partnerLink}
          </a>
          <p className="link-note">
            Clients visiting this link will see your customized SEO Audit page
            branded with your logo and colors.
          </p>
        </section>

        <section className="quick-menu">
          <Link to="/partner-settings" className="menu-card">
            <div className="menu-icon">⚙️</div>
            <h4>Brand Settings</h4>
            <p>Update your company name, colors, and logo.</p>
          </Link>

          {/* ✅ Updated Leads link */}
          <Link to="/partner-leads" className="menu-card">
            <div className="menu-icon">📊</div>
            <h4>Leads</h4>
            <p>View and manage your captured SEO leads.</p>
          </Link>

          {/* ✅ Updated SEO Audit link — goes to partner public page */}
          <a
            href={partnerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="menu-card"
          >
            <div className="menu-icon">🧠</div>
            <h4>Run SEO Audit</h4>
            <p>Open your branded SEO Audit page.</p>
          </a>
        </section>
      </div>
    </div>
  );
}

export default PartnerDashboard;
