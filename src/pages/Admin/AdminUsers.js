import { useEffect, useState } from "react";
import "./AdminUsers.css";
import Swal from "sweetalert2";
import { useAlert } from "../../utils/useAlert";

export default function AdminUsers() {
  const { success, error, confirm } = useAlert();
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "partner",
  });
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      // ✅ Make sure it's an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setUsers([]); // Prevent runtime crash
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Filtering + Sorting + Search
  const filteredUsers = [...users]
    .filter((u) => {
      const matchSearch = Object.values(u)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
      const matchStatus =
        statusFilter === "active"
          ? u.is_deleted === 0
          : u.is_deleted === 1;
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      const aVal = a[key] || "";
      const bVal = b[key] || "";
      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }
    });

  // ✅ Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ Save user
  const handleSave = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/api/admin/users/${editing.id}`
      : `${API_URL}/api/admin/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // ✅ handle backend errors (like duplicate email)
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to save user");
      }

      success(editing ? "User updated successfully!" : "User added successfully!");
      setModalOpen(false);
      setEditing(null);
      fetchUsers();
    } catch (err) {
      error(err.message || "Failed to save user. Try again.");
    }
  };

  // ✅ Soft delete
  const handleDelete = async (id) => {
    const ok = await confirm("Move this user to trash?");
    if (!ok) return;

    await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    success("User moved to trash!");
    fetchUsers();
  };

  // ✅ Restore user
  const handleRestore = async (id) => {
    const ok = await confirm("Restore this user?");
    if (!ok) return;

    await fetch(`${API_URL}/api/admin/users/${id}/restore`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    success("User restored!");
    fetchUsers();
  };

  // ✅ Change password
  const handleChangePassword = async (id) => {
    const ok = await confirm("Change this user's password?");
    if (!ok) return;

    const { value: newPassword } = await Swal.fire({
      title: "Enter New Password",
      input: "password",
      inputPlaceholder: "New password",
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#1a273b",
      cancelButtonColor: "#d33",
    });

    if (!newPassword) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Failed to update password");
      success("Password changed successfully!");
    } catch (err) {
      console.error("❌ Password change error:", err);
      error("Failed to change password.");
    }
  };

  // ✅ Export CSV (client-side, same as leads)
  const exportCSV = async () => {
    if (!users.length) return;

    const ok = await confirm(`Export ${users.length} users to CSV?`);
    if (!ok) return;

    try {
      const headers = Object.keys(users[0]).join(",");
      const rows = users.map((user) =>
        Object.values(user)
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const blob = new Blob([headers + "\n" + rows.join("\n")], {
        type: "text/csv",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "admin_users.csv";
      link.click();

      success("Users exported successfully!");
    } catch (err) {
      console.error("❌ Error exporting CSV:", err);
      error("Failed to export CSV. Try again.");
    }
  };

  return (
    <div className="main-layout">
      <main className="main-container">
        <h1 className="title">👥 User Management</h1>
        <p className="subtitle">Manage, restore, or remove users</p>

        {/* Filters */}
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="partner">Partners</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div className="admin-users-buttons">
            <button className="add-btn" onClick={() => setModalOpen(true)}>
              + Add User
            </button>
            <button className="add-btn" onClick={exportCSV}>
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="admin-table">
          <thead>
            <tr>
              {["id", "name", "email", "role", "last_login", "created_at"].map((col) => (
                <th key={col} onClick={() => toggleSort(col)}>
                  {col.toUpperCase()}{" "}
                  {sortConfig.key === col
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              ))}
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        background:
                          u.role === "admin" ? "#1a273b" : "#3b82f6",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.last_login
                      ? new Date(u.last_login).toLocaleString()
                      : "Never"}
                  </td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {u.is_deleted ? (
                      <button
                        className="edit-btn"
                        style={{ background: "#10b981" }}
                        onClick={() => handleRestore(u.id)}
                      >
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditing(u);
                            setFormData({ ...u, password: "" });
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="edit-btn"
                          style={{ background: "#6b7280" }}
                          onClick={() => handleChangePassword(u.id)}
                        >
                          Change Password
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: "20px" }}>
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
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editing ? "Edit User" : "Add User"}</h2>
              <form onSubmit={handleSave}>
                <label>Name</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <label>Email</label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />

                {!editing && (
                  <>
                    <label>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </>
                )}

                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="partner">Partner</option>
                </select>

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
