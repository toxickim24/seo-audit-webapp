import { useEffect, useState } from "react";
import "./AdminLeads.css";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ Fetch all leads
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/adminLeads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
      setFilteredLeads(data);
    } catch (err) {
      console.error("❌ Error fetching leads:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    const results = leads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q)
    );
    setFilteredLeads(results);
    setCurrentPage(1);
  }, [search, leads]);

  // ✅ Sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    } else {
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }
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

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`${API_URL}/api/adminLeads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // ✅ Export CSV
  const exportToCSV = () => {
    if (!leads.length) return;
    const headers = Object.keys(leads[0]).join(",");
    const rows = leads.map((lead) =>
      Object.values(lead)
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([headers + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "admin_leads.csv";
    link.click();
  };

  return (
    <div className="main-layout">
      <main className="main-container">
        <h1 className="title">Lead Management</h1>
        <p className="subtitle">View, sort, and export all leads.</p>

        {/* Search + Export */}
        <div className="actions">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchBox"
          />
          <button onClick={exportToCSV} className="exportBtn">
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="tableWrapper">
          <table className="table">
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
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name || "-"}</td>
                    <td>{lead.email || "-"}</td>
                    <td>{lead.phone || "-"}</td>
                    <td>{lead.company || "-"}</td>
                    <td>{lead.website || "-"}</td>
                    <td>{lead.score ?? "-"}</td>
                    <td>
                      {lead.date
                        ? new Date(lead.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="deleteBtn"
                        onClick={() => handleDelete(lead.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`pageBtn ${
                  currentPage === i + 1 ? "activePage" : ""
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
