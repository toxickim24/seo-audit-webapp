import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PartnerDashboard.css";

function PartnerDashboard() {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/partners/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch partner data");
        const data = await res.json();

        setPartner(data.partner);
      } catch (err) {
        console.error("❌ Partner fetch failed:", err);
        setPartner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, []);

  if (loading) return <p>Loading partner data...</p>;

  if (!partner) {
    return (
      <div className="main-layout">
        <div className="partner-dashboard">
          <h2>Partner info not found</h2>
          <p>Please log in again to access your dashboard.</p>
          <Link to="/login" className="menu-card">Go to Login</Link>
        </div>
      </div>
    );
  }

  const partnerLink = `${window.location.origin}/${partner.slug || ""}`;
  const creditColor =
    partner.credits > 2
      ? "var(--green-500, #10b981)"
      : partner.credits === 2
      ? "var(--yellow-500, #f59e0b)"
      : partner.credits === 1
      ? "var(--red-500, #ef4444)"
      : "#9ca3af";

  return (
    <div className="main-layout">
      <div className="partner-dashboard">
        <header className="dashboard-header">
          <section className="welcome-section">
            <h1 className="title">
              👋 Welcome, <span>{partner.company_name}</span>
            </h1>
            <p className="subtitle">
              Manage your brand, track leads, and share your white-label SEO Audit page.
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

        {/* ✅ Quick Menu Section */}
        <section className="quick-menu">

          {/* ✅ Credits Card */}
          <div className="menu-card credits-tile">
            <div className="menu-icon">
              💳
            </div>
            <h4>Remaining Credits</h4>
            <p className="credits-value" style={{ color: creditColor }}>
              {partner.credits ?? "—"}
            </p>
            <p className="credits-note">
              {typeof partner.credits === "number"
                ? partner.credits > 0
                  ? "Each SEO audit consumes 1 credit."
                  : "No credits left — contact support."
                : "Loading credits..."}
            </p>
          </div>

          {/* Brand Settings */}
          <Link to="/partner-settings" className="menu-card">
            <div className="menu-icon">⚙️</div>
            <h4>Brand Settings</h4>
            <p>Update your company name, colors, and logo.</p>
          </Link>

          {/* Leads */}
          <Link to="/partner-leads" className="menu-card">
            <div className="menu-icon">📊</div>
            <h4>Leads</h4>
            <p>View and manage your captured SEO leads.</p>
          </Link>

          {/* Run SEO Audit */}
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
