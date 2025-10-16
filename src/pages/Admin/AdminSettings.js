import { useEffect, useState } from "react";
import "./AdminSettings.css";
import { useAlert } from "../../utils/useAlert";

export default function AdminSettings() {
  const { success, error, confirm } = useAlert();
  const [settings, setSettings] = useState({
    site_name: "",
    contact_email: "",
    primary_color: "#1a273b",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("❌ Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      success("✅ Settings saved successfully!");
    } catch (err) {
      console.error("❌ Save failed:", err);
      error("❌ Save failed:");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-layout">
      <main className="main-container">
        <h1 className="title">⚙️ Admin Settings</h1>
        <p className="subtitle">
          Manage platform configuration and branding preferences.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <form className="settings-form" onSubmit={handleSave}>
            <label>Site Name</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) =>
                setSettings({ ...settings, site_name: e.target.value })
              }
              required
            />

            <label>Contact Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) =>
                setSettings({ ...settings, contact_email: e.target.value })
              }
              required
            />

            <label>Primary Color</label>
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) =>
                setSettings({ ...settings, primary_color: e.target.value })
              }
            />

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
