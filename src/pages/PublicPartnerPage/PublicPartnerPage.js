import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./PublicPartnerPage.css";

function PublicPartnerPage() {
  const { slug } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "/api";

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await axios.get(`${API_BASE}/partner/${slug}`);
        setPartner(res.data);
      } catch (err) {
        console.error("❌ Partner fetch error:", err);
        setError("Partner not found or profile not available.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [slug, API_BASE]);

  if (loading)
    return (
      <div className="public-partner-page">
        <p className="loading">Loading partner profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="public-partner-page">
        <div className="error-box">{error}</div>
      </div>
    );

  const primary = partner.primary_color || "#FB6A45";
  const secondary = partner.secondary_color || "#FF8E3A";
  const accent = partner.accent_color || "#22354D";

  return (
    <div
      className="public-partner-page"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${secondary})`,
        color: "#fff",
      }}
    >
      <div className="partner-container">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={`${partner.company_name} logo`}
            className="partner-logo"
          />
        ) : (
          <div
            className="partner-logo-placeholder"
            style={{ backgroundColor: primary }}
          >
            {partner.company_name?.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="partner-name">{partner.company_name}</h1>

        <p className="partner-tagline">
          Powered by <strong>SEO Mojo</strong>
        </p>

        <div
          className="partner-highlight-box"
          style={{ backgroundColor: primary }}
        >
          <h2>Welcome to {partner.company_name}</h2>
          <p>
            This page is powered by <strong>SEO Mojo</strong> to showcase your
            company’s profile, logo, and colors.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicPartnerPage;
