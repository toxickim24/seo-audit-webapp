import { useEffect, useState } from "react";
import styles from "./LeadsManagement.module.css";

function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ Fetch leads
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching leads:", err);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ Search filter
  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some((val) =>
      String(val || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  // ✅ Sorting
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";
    if (sortConfig.direction === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // ✅ Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ✅ Toggle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error("❌ Error deleting lead:", err.message);
      alert("Failed to delete lead. Check server logs.");
    }
  };

  // ✅ Export CSV
  const exportToCSV = () => {
    if (!leads.length) return;
    const headers = Object.keys(leads[0]).join(",");
    const rows = leads.map((lead) =>
      Object.values(lead)
        .map((val) => `"${String(val || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leads.csv";
    link.click();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 Lead Management Dashboard</h1>
      <span className={styles.subtitle}>Manage and analyze your SEO audit leads</span>

      {/* Search + Export */}
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBox}
        />
        {leads.length > 0 && (
          <button onClick={exportToCSV} className={styles.exportBtn}>
            Export CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {["name", "email", "phone", "company", "website", "score", "date"].map(
                (col) => (
                  <th key={col} onClick={() => handleSort(col)}>
                    {col.toUpperCase()}{" "}
                    {sortConfig.key === col
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )
              )}
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length ? (
              paginatedLeads.map((lead) => (
                <tr key={lead.id}>
                  <td data-label="Name">{lead.name || "-"}</td>
                  <td data-label="Email">{lead.email || "-"}</td>
                  <td data-label="Phone">{lead.phone || "-"}</td>
                  <td data-label="Company">{lead.company || "-"}</td>
                  <td data-label="Website">{lead.website || "-"}</td>
                  <td data-label="Score">{lead.score ?? "-"}</td>
                  <td data-label="Date">
                    {lead.date ? new Date(lead.date).toLocaleString() : "-"}
                  </td>
                  <td data-label="Actions">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No leads found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`${styles.pageBtn} ${
                currentPage === i + 1 ? styles.activePage : ""
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeadsManagement;
