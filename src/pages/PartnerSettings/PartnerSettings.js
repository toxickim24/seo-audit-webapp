import { useState, useEffect } from "react";
import axios from "axios";
import "./PartnerSettings.css";

function PartnerSettings() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "/api";

  // ✅ Lightweight slugify replacement (browser-safe)
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // spaces → dash
      .replace(/[^\w\-]+/g, "") // remove non-word chars
      .replace(/\-\-+/g, "-"); // collapse multiple dashes

  const [form, setForm] = useState({
    company_name: storedUser?.company_name || "",
    slug: storedUser?.slug || "",
    subdomain: "",
    logo_url: "",
    primary_color: "#FB6A45",
    secondary_color: "#FF8E3A",
    accent_color: "#22354D",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugStatus, setSlugStatus] = useState("");

  // ✅ Load existing partner info
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await axios.get(`${API_BASE}/partners/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.partner || res.data || {};
        setForm((prev) => ({
          company_name: data.company_name || prev.company_name,
          slug: data.slug || prev.slug,
          subdomain: data.subdomain || "",
          logo_url: data.logo_url || "",
          primary_color: data.primary_color || "#FB6A45",
          secondary_color: data.secondary_color || "#FF8E3A",
          accent_color: data.accent_color || "#22354D",
        }));
      } catch (err) {
        console.warn("⚠️ Partner fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [API_BASE, token]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "slug") {
      const cleanSlug = slugify(value);
      setForm((prev) => ({ ...prev, slug: cleanSlug }));
      setSlugStatus("");
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Save updates
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSlugStatus("");

    try {
      const res = await axios.put(`${API_BASE}/partners`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Partner settings updated successfully!");
      // setSlugStatus("✅ Saved!");
      const updatedUser = { ...storedUser, ...form, slug: res.data.partner?.slug };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("❌ Save Error:", err);
      const msg =
        err.response?.data?.error || "Failed to save settings. Please try again.";
      setSlugStatus(msg.includes("taken") ? "❌ Slug already taken" : "");
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="partner-settings loading">
        <p>Loading settings...</p>
      </div>
    );

  return (
    <div className="partner-settings-page">
      <div className="settings-header">
        <h1>⚙️ Partner Settings</h1>
        <p className="subtitle">
          Customize your company details, logo, brand colors, and public link slug.
        </p>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* ===== Company Info ===== */}
        <div className="settings-card">
          <h2>🏢 Company Information</h2>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Slug (Public Link)</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. ek-productions"
              required
            />
            {slugStatus && <p className="slug-status">{slugStatus}</p>}
            <p className="partner-slug">
              Your link:{" "}
              <a
                href={`http://localhost:3000/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-slug-url"
              >
                http://localhost:3000/{form.slug}
              </a>
            </p>
          </div>

          {/*
          <div className="form-group">
            <label>Subdomain (optional)</label>
            <input
              type="text"
              name="subdomain"
              value={form.subdomain}
              onChange={handleChange}
              placeholder="e.g. ek"
            />
          </div>
          */}

          <div className="form-group">
            <label>Logo URL (optional)</label>
            <input
              type="text"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {form.logo_url && (
            <div className="logo-preview-container">
              <img
                src={form.logo_url}
                alt="Partner Logo"
                className="logo-preview"
              />
            </div>
          )}
        </div>

        {/* ===== Brand Colors ===== */}
        <div className="settings-card">
          <h2>🎨 Brand Colors</h2>

          <div className="color-grid">
            {["primary_color", "secondary_color", "accent_color"].map((key) => (
              <div key={key} className="color-item">
                <label>{key.replace("_", " ").replace("color", "Color")}</label>
                <input
                  type="color"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== Save Button ===== */}
        <div className="save-btn-container">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartnerSettings;
