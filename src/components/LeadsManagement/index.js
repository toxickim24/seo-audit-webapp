import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import styles from "./LeadsManagement.module.css";

function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leads from backend
  useEffect(() => {
    fetch("http://localhost:5000/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(Array.isArray(data) ? data : []); // ✅ always array
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leads:", err);
        setLoading(false);
      });
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await fetch(`http://localhost:5000/leads/${id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  // DataTable columns
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Company", selector: (row) => row.company, sortable: true },
    { name: "Website", selector: (row) => row.website, sortable: true },
    { name: "Score", selector: (row) => row.score, sortable: true },
    {
      id: "date",
      name: "Date",
      selector: (row) => new Date(row.date).getTime(),
      sortable: true,
      format: (row) => new Date(row.date).toLocaleString(),
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className={styles.deleteBtn}
          onClick={() => handleDelete(row.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  // ✅ CSV Headers
  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Website", key: "website" },
    { label: "Score", key: "score" },
    { label: "Date", key: "date" },
  ];

  return (
    <div className={styles.container}>
      <h2>Leads Management Dashboard</h2>

      <div className={styles.actions}>
	  {leads.length > 0 && (
	    <CSVLink
	      data={Array.isArray(leads) ? leads : []}
	      headers={csvHeaders}
	      filename="leads.csv"
	      className={styles.exportBtn}
	    >
	      Export CSV
	    </CSVLink>
	  )}
	</div>

	<div className={styles.tableWrapper}>
	    <DataTable
	      columns={columns}
	      data={leads}
	      progressPending={loading}
	      pagination
	      highlightOnHover
	      striped
	      responsive
	      defaultSortFieldId="date"
	      defaultSortAsc={false}
	    />
    </div>

    </div>
  );
}

export default LeadsManagement;
