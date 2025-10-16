import { useEffect, useState } from "react";
import "./AdminPartners.css";

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    slug: "",
    primary_color: "#1a273b",
  });
  const [editing, setEditing] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchPartners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error("❌ Error fetching partners:", err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/api/admin/partners/${editing.id}`
      : `${API_URL}/api/admin/partners`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    setModalOpen(false);
    setEditing(null);
    fetchPartners();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this partner?")) return;
    await fetch(`${API_URL}/api/admin/partners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPartners();
  };

  return (
    <div className="main-layout">
      <main className="main-container">
        <h1 className="title">Partners</h1>
        <p  className="subtitle">Manage all partner companies</p>

        <div className="actions">
          <button className="add-btn" onClick={() => setModalOpen(true)}>
            + Add Partner
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company</th>
              <th>Slug</th>
              <th>Primary Color</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan="5">No partners found</td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.company_name}</td>
                  <td>{p.slug}</td>
                  <td>
                    <span
                      className="color-preview"
                      style={{ background: p.primary_color }}
                    ></span>{" "}
                    {p.primary_color}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditing(p);
                        setFormData(p);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editing ? "Edit Partner" : "Add Partner"}</h2>
              <form onSubmit={handleSave}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
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

                <div className="modal-actions">
                  <button type="submit">Save</button>
                  <button
                    type="button"
                    className="cancel-btn"
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
