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
  const [uploading, setUploading] = useState(false);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Initialize form state
  const [form, setForm] = useState({
    company_name: "",
    slug: "",
    primary_color: "#1a273b",
    secondary_color: "#2563eb",
    accent_color: "#10b981",
    user_id: "",
    logo_url: "",
    credits: 3,
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
  
  // ✨ Auto-generate slug when company_name changes (skip when editing)
  useEffect(() => {
    if (!editing) {
      const generatedSlug = form.company_name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // replace spaces & special chars
        .replace(/^-+|-+$/g, ""); // trim dashes
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.company_name]);

  // ✅ Fetch Users for Dropdown
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(
        Array.isArray(data)
          ? data.filter((u) => u.is_deleted === 0 && u.role !== "admin")
          : []
      );
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchUsers();
  }, []);

  // ✅ Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch(`${API_URL}/api/upload/logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((prev) => ({ ...prev, logo_url: data.url }));
    } catch (err) {
      console.error("❌ Upload error:", err);
      error("Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Add / Edit Partner
  const handleSave = async (e) => {
    e.preventDefault();

    // ✅ Check if slug already exists
    const slugTaken = partners.find(
      (p) =>
        p.slug?.toLowerCase() === form.slug?.toLowerCase() &&
        p.id !== (editing?.id || null)
    );

    if (slugTaken) {
      error(
        `The slug "${form.slug}" is already used by ${slugTaken.company_name}. Please choose another slug.`
      );
      return;
    }

    // ✅ Check if user is already assigned to another partner
    if (form.user_id) {
      const alreadyAssigned = partners.find(
        (p) => String(p.user_id) === String(form.user_id) && p.id !== (editing?.id || null)
      );

      if (alreadyAssigned) {
        error(
          `${alreadyAssigned.user_name || "This user"} is already assigned to another partner (${alreadyAssigned.company_name}). Please choose a different user.`
        );
        return;
      }
    }

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
        body: JSON.stringify(form),
      });

      success(editing ? "Partner updated successfully!" : "Partner added successfully!");
      setModalOpen(false);
      setEditing(null);
      fetchPartners();
    } catch (err) {
      console.error("❌ Error saving partner:", err);
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

  // ✅ Export CSV
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

  // ✅ Filter + Pagination
  const filteredPartners = partners.filter((p) => {
    const matchSearch = p.company_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "active" ? p.is_deleted === 0 : p.is_deleted === 1;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

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
            <button
              onClick={() => {
                setEditing(null);
                setForm({
                  company_name: "",
                  slug: "",
                  primary_color: "#1a273b",
                  secondary_color: "#2563eb",
                  accent_color: "#10b981",
                  user_id: "",
                  logo_url: "",
                  credits: 3,
                });
                setModalOpen(true);
              }}
            >
              + Add Partner
            </button>
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
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPartners.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No partners found
                </td>
              </tr>
            ) : (
              paginatedPartners.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={p.logo_url || "/seo-logo.png"} alt="logo" />
                  </td>
                  <td>{p.company_name}</td>
                  <td>
                    <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
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
                  <td>{p.credits}</td>
                  <td>
                    <span
                      className={`admin-partners-status ${p.is_deleted ? "inactive" : "active"}`}
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
                            setForm({
                              company_name: p.company_name || "",
                              slug: p.slug || "",
                              primary_color: p.primary_color || "#1a273b",
                              secondary_color: p.secondary_color || "#2563eb",
                              accent_color: p.accent_color || "#10b981",
                              user_id: p.user_id || "",
                              logo_url: p.logo_url || "",
                              credits: p.credits ?? 3, 
                            });
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

        {/* ✅ Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: "20px", textAlign: "center" }}>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`pageBtn ${currentPage === i + 1 ? "activePage" : ""}`}
                style={{
                  margin: "0 4px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: currentPage === i + 1 ? "#1a273b" : "#fff",
                  color: currentPage === i + 1 ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="admin-partners-modal-overlay">
            <div className="admin-partners-modal">
              <h2>{editing ? "Edit Partner" : "Add Partner"}</h2>
              <form onSubmit={handleSave} className="partners-form">
                <label>Company Name</label>
                <input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  required
                />

                <label>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />

                <label>Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
                {uploading && <p>Uploading...</p>}
                {form.logo_url && (
                  <img
                    src={form.logo_url}
                    alt="preview"
                    style={{
                      width: "auto",
                      height: "60px",
                      objectFit: "contain",
                      margin: "8px 0",
                    }}
                  />
                )}

                <label>Primary Color</label>
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />

                <label>Secondary Color</label>
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                />

                <label>Accent Color</label>
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                />

                <label>Credits</label>
                <input
                  type="number"
                  min="0"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  required
                />

                <label>Assign User</label>
                <select
                  value={form.user_id || ""}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  required
                >
                  <option value="">— None —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <div className="admin-partners-modal-actions">
                  <button type="submit" className="save">Save</button>
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
