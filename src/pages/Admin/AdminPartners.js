import { useEffect, useState } from "react";
import "./AdminPartners.css";
import { useAlert } from "../../utils/useAlert";

export default function AdminPartners() {
  const { success, error, confirm } = useAlert();
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [formData, setFormData] = useState({
    company_name: "",
    slug: "",
    primary_color: "#1a273b",
    secondary_color: "#2563eb",
    accent_color: "#10b981",
    user_id: "",
    logo_url: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ Fetch Partners
  const fetchPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching partners:", err);
    }
  };

  // ✅ Fetch Users for Dropdown
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data.filter((u) => u.is_deleted === 0) : []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchUsers();
  }, []);

  // ✅ Add / Edit Partner
  const handleSave = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/api/admin/partners/${editing.id}`
      : `${API_URL}/api/admin/partners`;

    const ok = await confirm(editing ? "Update this partner?" : "Add new partner?");
    if (!ok) return;

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      success(editing ? "Partner updated successfully!" : "Partner added successfully!");
      setModalOpen(false);
      setEditing(null);
      fetchPartners();
    } catch (err) {
      error("Failed to save partner. Try again.");
    }
  };

  // ✅ Soft Delete
  const handleDelete = async (id) => {
    const ok = await confirm("Move this partner to trash?");
    if (!ok) return;
    await fetch(`${API_URL}/api/admin/partners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    success("Partner moved to trash!");
    fetchPartners();
  };

  // ✅ Restore
  const handleRestore = async (id) => {
    const ok = await confirm("Restore this partner?");
    if (!ok) return;
    await fetch(`${API_URL}/api/admin/partners/${id}/restore`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    success("Partner restored!");
    fetchPartners();
  };

  // ✅ Export CSV (with confirmation)
  const exportCSV = async () => {
    const filtered = partners.filter((p) =>
      statusFilter === "active" ? p.is_deleted === 0 : p.is_deleted === 1
    );
    if (!filtered.length) return error("No partners to export.");

    const ok = await confirm(`Export ${filtered.length} partners to CSV?`);
    if (!ok) return;

    try {
      const headers = Object.keys(filtered[0]).join(",");
      const rows = filtered.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const blob = new Blob([headers + "\n" + rows.join("\n")], {
        type: "text/csv",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "partners.csv";
      link.click();
      success("Partners exported successfully!");
    } catch (err) {
      console.error("❌ Error exporting CSV:", err);
      error("Failed to export partners. Try again.");
    }
};

  // ✅ Filtered Partners
  const filteredPartners = partners.filter((p) => {
    const matchSearch = p.company_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "active" ? p.is_deleted === 0 : p.is_deleted === 1;
    return matchSearch && matchStatus;
  });

  return (
    <div className="main-layout">
      <main className="main-container admin-partners-layout">
        <h1 className="title">🏢 Partners</h1>
        <p className="subtitle">Manage partner companies and assigned users</p>

        <div className="admin-partners-actions">
          <div className="admin-partners-filters">
            <input
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="admin-partners-buttons">
            <button onClick={() => setModalOpen(true)}>+ Add Partner</button>
            <button onClick={exportCSV}>⬇️ Export CSV</button>
          </div>
        </div>

        <table className="admin-partners-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Company</th>
              <th>Slug</th>
              <th>Theme</th>
              <th>User Assigned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No partners found
                </td>
              </tr>
            ) : (
              filteredPartners.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.logo_url || "/seo-logo.png"}
                      alt="logo"
                    />
                  </td>
                  <td>{p.company_name}</td>
                  <td>
                    <a
                      href={`/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.slug}
                    </a>
                  </td>
                  <td>
                    <div className="color-dots">
                      <span className="color-dot" style={{ background: p.primary_color }}></span>
                      <span className="color-dot" style={{ background: p.secondary_color }}></span>
                      <span className="color-dot" style={{ background: p.accent_color }}></span>
                    </div>
                  </td>
                  <td>{p.user_name || "—"}</td>
                  <td>
                    <span
                      className={`admin-partners-status ${
                        p.is_deleted ? "inactive" : "active"
                      }`}
                    >
                      {p.is_deleted ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="admin-partners-actions-col">
                    {p.is_deleted ? (
                      <button
                        className="admin-partners-btn restore"
                        onClick={() => handleRestore(p.id)}
                      >
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          className="admin-partners-btn edit"
                          onClick={() => {
                            setEditing(p);
                            setFormData(p);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-partners-btn delete"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {modalOpen && (
          <div className="admin-partners-modal-overlay">
            <div className="admin-partners-modal">
              <h2>{editing ? "Edit Partner" : "Add Partner"}</h2>
              <form onSubmit={handleSave} className="partners-form">
                <label>Company Name</label>
                <input
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />

                <label>Slug</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />

                <label>Primary Color</label>
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_color: e.target.value })
                  }
                />

                <label>Secondary Color</label>
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) =>
                    setFormData({ ...formData, secondary_color: e.target.value })
                  }
                />

                <label>Accent Color</label>
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) =>
                    setFormData({ ...formData, accent_color: e.target.value })
                  }
                />

                <label>Assign User</label>
                <select
                  value={formData.user_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                >
                  <option value="">— None —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <div className="admin-partners-modal-actions">
                  <button type="submit" className="save">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
