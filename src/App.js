import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PartnerDashboard from "./pages/PartnerDashboard/PartnerDashboard";
import PartnerSettings from "./pages/PartnerSettings/PartnerSettings";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import PublicPartnerPage from "./pages/PublicPartnerPage";
import PartnerLeadsManagement from "./pages/PartnerLeadsManagement";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const [partnerData, setPartnerData] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Common public routes that are NOT partner slugs
  const knownRoutes = [
    "",
    "seo-audit",
    "seo-pricing",
    "seo-tools",
    "seo-contact",
    "leads-management",
    "partner-login",
    "partner-register",
    "partner-dashboard",
    "partner-settings",
    "partner-leads",
  ];

  // Extract first path segment (e.g., "/vestedgroup" → "vestedgroup")
  const firstSegment = location.pathname.split("/")[1] || "";
  const isPartnerPublic = firstSegment && !knownRoutes.includes(firstSegment);

  useEffect(() => {
    const loadPartnerData = async () => {
      if (isPartnerPublic) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/partners/${firstSegment}`);
          if (!res.ok) throw new Error("Partner not found");
          const data = await res.json();
          setPartnerData(data);

          // Apply color theme dynamically
          document.documentElement.style.setProperty("--primary-color", data.primary_color || "#22354d");
          document.documentElement.style.setProperty("--secondary-color", data.secondary_color || "#fb6a45");
        } catch (err) {
          console.error("❌ Failed to load partner:", err);
          setPartnerData(null);
          // fallback to default colors
          document.documentElement.style.setProperty("--primary-color", "#22354d");
          document.documentElement.style.setProperty("--secondary-color", "#fb6a45");
        }
      } else {
        // Reset theme for non-partner pages
        setPartnerData(null);
        document.documentElement.style.setProperty("--primary-color", "#22354d");
        document.documentElement.style.setProperty("--secondary-color", "#fb6a45");
      }
    };

    loadPartnerData();
  }, [location.pathname, isPartnerPublic]);

  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "seo-pricing", label: "Pricing" },
    { id: "seo-tools", label: "Tools" },
    { id: "seo-contact", label: "Contact" },
    { id: "leads-management", label: "Lead Management" },
  ];

  return (
    <>
      <Header tabs={tabs} partnerData={partnerData} />

      <Routes>
        {/* ✅ Normal public routes */}
        <Route path="/seo-audit" element={<Main activeTab="seo-audit" />} />
        <Route path="/seo-pricing" element={<Main activeTab="seo-pricing" />} />
        <Route path="/seo-tools" element={<Main activeTab="seo-tools" />} />
        <Route path="/seo-contact" element={<Main activeTab="seo-contact" />} />
        <Route path="/leads-management" element={<Main activeTab="leads-management" />} />

        {/* ✅ Partner login/register/dashboard */}
        <Route path="/partner-login" element={<Login />} />
        <Route path="/partner-register" element={<Register />} />
        <Route
          path="/partner-dashboard"
          element={
            <ProtectedRoute>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-settings"
          element={
            <ProtectedRoute>
              <PartnerSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/partner-leads" element={<PartnerLeadsManagement />} />

        {/* ✅ Dynamic partner page — clean slug */}
        <Route path="/:slug" element={<PublicPartnerPage />} />

        {/* ✅ Root redirect */}
        <Route path="/" element={<Navigate to="/seo-audit" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/seo-audit" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
