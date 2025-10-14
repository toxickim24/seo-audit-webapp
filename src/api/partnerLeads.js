// src/api/partnerLeads.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ✅ Helper: Get Authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ============================================================
// ✅ Get all leads for logged-in partner
// ============================================================
export const fetchPartnerLeads = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/partner/leads`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch leads");
    return await res.json();
  } catch (err) {
    console.error("❌ Error fetching partner leads:", err);
    return [];
  }
};

// ============================================================
// ✅ Add new partner lead
// ============================================================
export const addPartnerLead = async (leadData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/partner/leads`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add lead");
    return data;
  } catch (err) {
    console.error("❌ Error adding partner lead:", err);
    throw err;
  }
};

// ============================================================
// ✅ Delete partner lead
// ============================================================
export const deletePartnerLead = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/partner/leads/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete lead");
    return true;
  } catch (err) {
    console.error("❌ Error deleting partner lead:", err);
    throw err;
  }
};
