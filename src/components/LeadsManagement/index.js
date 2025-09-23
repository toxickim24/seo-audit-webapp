import { useEffect, useState } from "react";
import styles from "./LeadsManagement.module.css";

function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  // ✅ Fetch leads from backend
  const fetchLeads = async () => {
    try {
      const res = await fetch("http://localhost:5000/leads");
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
      String(val || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  // ✅ Sorting
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";

    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // ✅ Toggle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ Delete lead from DB
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`http://localhost:5000/leads/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete lead");

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      console.log(`✅ Lead ${id} deleted from DB`);
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
      <h2 className={styles.title}>📊 Lead Management Dashboard</h2>
      <span>Manage and analyze your SEO audit leads</span>

      {/* Search + Export Row */}
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
              {[
                "id",
                "name",
                "email",
                "phone",
                "company",
                "website",
                "score",
                "date",
              ].map((col) => (
                <th key={col} onClick={() => handleSort(col)}>
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
            {sortedLeads.length ? (
              sortedLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id}</td>
                  <td>{lead.name || "-"}</td>
                  <td>{lead.email || "-"}</td>
                  <td>{lead.phone || "-"}</td>
                  <td>{lead.company || "-"}</td>
                  <td>{lead.website || "-"}</td>
                  <td>{lead.score ?? "-"}</td>
                  <td>
                    {lead.date
                      ? new Date(lead.date).toLocaleString()
                      : "-"}
                  </td>
                  <td>
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
                <td colSpan="9">No leads found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsManagement;
