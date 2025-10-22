import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import usePartnerTheme from "./hooks/usePartnerTheme";

// ✅ Public pages
import Main from "./components/Main";
import Login from "./pages/Login/Login";

// ✅ Partner pages
import PartnerDashboard from "./pages/PartnerDashboard/PartnerDashboard";
import PartnerSettings from "./pages/PartnerSettings/PartnerSettings";
import PartnerLeads from "./pages/PartnerLeadsManagement";

// ✅ Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminPartners from "./pages/Admin/AdminPartners";
import AdminLeads from "./pages/Admin/AdminLeads";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminUsers from "./pages/Admin/AdminUsers";

// ✅ Public partner page (/:slug)
import PublicPartnerPage from "./pages/PublicPartnerPage";

import "./App.css";

function AppContent() {
  const { partnerData, isPartnerPublic } = usePartnerTheme();
  const isLoggedIn = !!localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "seo-pricing", label: "Pricing" },
    { id: "seo-tools", label: "Tools" },
    { id: "seo-contact", label: "Contact" },
  ];

  // ✅ Role-based home redirect
  const getHomeRedirect = () => {
    if (isLoggedIn && role === "admin") return "/admin-dashboard";
    if (isLoggedIn && role === "partner") return "/partner-dashboard";
    return "/seo-audit";
  };

  return (
    <>
      <Header tabs={tabs} partnerData={partnerData} />

      <Routes>
        {/* ======================================================
           ✅ Public Pages
        ====================================================== */}
        <Route path="/seo-audit" element={<Main activeTab="seo-audit" />} />
        <Route path="/seo-pricing" element={<Main activeTab="seo-pricing" />} />
        <Route path="/seo-tools" element={<Main activeTab="seo-tools" />} />
        <Route path="/seo-contact" element={<Main activeTab="seo-contact" />} />

        <Route path="/login" element={<Login />} />

        {/* ======================================================
           ✅ Partner Pages
        ====================================================== */}
        <Route
          path="/partner-dashboard"
          element={
            <ProtectedRoute requiredRole="partner">
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-settings"
          element={
            <ProtectedRoute requiredRole="partner">
              <PartnerSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-leads"
          element={
            <ProtectedRoute requiredRole="partner">
              <PartnerLeads />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
           ✅ Admin Pages
        ====================================================== */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-partners"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-leads"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
           ✅ Public Partner Pages
        ====================================================== */}
        <Route path="/:slug" element={<PublicPartnerPage />} />

        {/* ======================================================
           ✅ Default & Fallback
        ====================================================== */}
        <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
        <Route path="*" element={<Navigate to="/seo-audit" replace />} />
      </Routes>

      {<Footer partnerData={partnerData} />}
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
