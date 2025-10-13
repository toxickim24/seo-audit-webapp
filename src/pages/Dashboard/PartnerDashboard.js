import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PartnerDashboard.css";

function PartnerDashboard() {
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setPartner(JSON.parse(storedUser));
      } catch (err) {
        console.error("❌ Error parsing user data:", err);
      }
    }
  }, []);

  if (!partner) {
    return (
      <div className="partner-dashboard loading">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const partnerLink = `${window.location.origin}/${partner.slug}`;

  return (
    <div className="partner-dashboard">
      {/* ======== Dashboard Content ======== */}
      <main className="partner-main">
        <section className="welcome-section">
          <h1>
            Welcome, <span>{partner.company_name || partner.name}</span> 👋
          </h1>
          <p className="subtitle">
            This is your partner dashboard — manage your brand, track leads, and
            share your white-label SEO Audit page with clients.
          </p>
        </section>

        {/* ======== Partner Link Card ======== */}
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

        {/* ======== Quick Menu ======== */}
        <section className="quick-menu">
          <Link to="/partner-settings" className="menu-card">
            <div className="menu-icon">⚙️</div>
            <h4>Brand Settings</h4>
            <p>Update your company name, colors, and logo.</p>
          </Link>

          <Link to="/leads-management" className="menu-card">
            <div className="menu-icon">📊</div>
            <h4>Leads</h4>
            <p>View and manage your captured SEO leads.</p>
          </Link>

          <Link to="/seo-audit" className="menu-card">
            <div className="menu-icon">🧠</div>
            <h4>Run SEO Audit</h4>
            <p>Generate a new SEO report for any website.</p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default PartnerDashboard;
