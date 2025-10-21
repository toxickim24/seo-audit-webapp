import { useState, useEffect } from "react";
import axios from "axios";
import usePartnerTheme from "../../hooks/usePartnerTheme";
import "./PartnerSettings.css";
import { useAlert } from "../../utils/useAlert";

function PartnerSettings() {
  const { success, error, confirm } = useAlert();
  const { partnerData } = usePartnerTheme();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "/api";

  // ✅ Initialize form state
  const [form, setForm] = useState({
    company_name: storedUser?.company_name || "",
    slug: storedUser?.slug || "",
    subdomain: "",
    logo_url: "",
    primary_color: storedUser?.primary_color || "",
    secondary_color: storedUser?.secondary_color || "",
    accent_color: storedUser?.accent_color || "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugStatus, setSlugStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Lightweight slugify
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");

  // ✅ Fetch partner info
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
          primary_color: data.primary_color || "",
          secondary_color: data.secondary_color || "",
          accent_color: data.accent_color || "",
        }));
      } catch (err) {
        console.warn("⚠️ Partner fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [API_BASE, token]);
  
  // ✨ Auto-generate slug from company_name (skip if manually editing slug)
  useEffect(() => {
    const generatedSlug = form.company_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, slug: generatedSlug }));
  }, [form.company_name]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
      setSlugStatus("");
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Upload logo handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch(`${API_BASE}/upload/logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setForm((prev) => ({ ...prev, logo_url: data.url }));
    } catch (err) {
      console.error("❌ Logo upload failed:", err);
      error("Logo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save settings
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSlugStatus("");

    try {
      const payload = {
        ...form,
        primary_color: form.primary_color || null,
        secondary_color: form.secondary_color || null,
        accent_color: form.accent_color || null,
      };

      const res = await axios.put(`${API_BASE}/partners`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      success("✅ Partner settings updated successfully!");

      const updatedUser = {
        ...storedUser,
        ...form,
        slug: res.data.partner?.slug,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("❌ Save Error:", err);
      const msg =
        err.response?.data?.error ||
        "Failed to save settings. Please try again.";
      setSlugStatus(msg.includes("taken") ? "❌ Slug already taken" : "");
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading partner settings...</p>;

  return (
    <div className="main-layout">
      <div className="partner-settings-page">
        <div className="settings-header">
          <h1 className="title">⚙️ Partner Settings</h1>
          <p className="subtitle">
            Customize your company details, logo, brand colors, and public link.
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
                placeholder="e.g. my-company"
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

            {/* ===== Upload Logo ===== */}
            <div className="form-group">
              <label>Upload Logo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
              {uploading && <p>Uploading...</p>}
            </div>

            {form.logo_url && (
              <div className="logo-preview-container">
                <img
                  src={
                    form.logo_url.startsWith("http")
                      ? form.logo_url
                      : `${API_BASE.replace("/api", "")}${form.logo_url}`
                  }
                  alt="Partner Logo"
                  className="logo-preview"
                />
                <button
                  type="button"
                  className="remove-logo-btn"
                  onClick={() => setForm((prev) => ({ ...prev, logo_url: "" }))}
                >
                  ❌ Remove Logo
                </button>
              </div>
            )}
          </div>

          {/* ===== Brand Colors ===== */}
          <div className="settings-card">
            <h2>🎨 Brand Colors</h2>
            <div className="color-grid">
              {["primary_color", "secondary_color", "accent_color"].map((key) => (
                <div key={key} className="color-item">
                  <label>
                    {key.replace("_", " ").replace("color", "Color")}
                  </label>
                  <input
                    type="color"
                    name={key}
                    value={form[key] || "#cccccc"}
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
    </div>
  );
}

export default PartnerSettings;
