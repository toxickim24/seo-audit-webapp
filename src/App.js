import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import PartnerDashboard from "./pages/PartnerDashboard/PartnerDashboard";
import PartnerSettings from "./pages/PartnerSettings/PartnerSettings";
import PartnerLeadsManagement from "./pages/PartnerLeadsManagement";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import PublicPartnerPage from "./pages/PublicPartnerPage";

import usePartnerTheme from "./hooks/usePartnerTheme";

import "./App.css";

function AppContent() {
  // ✅ use the hook correctly
  const { partnerData, isPartnerPublic, loading } = usePartnerTheme();

  // Tabs for public navigation
  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "seo-pricing", label: "Pricing" },
    { id: "seo-tools", label: "Tools" },
    { id: "seo-contact", label: "Contact" },
    { id: "leads-management", label: "Lead Management" },
  ];

  // Optional: show loading state while partner theme loads
  if (loading) {
    return <p className="loading">Loading theme...</p>;
  }

  return (
    <>
      <Header tabs={tabs} partnerData={partnerData} />

      <Routes>
        {/* ✅ Public Pages */}
        <Route path="/seo-audit" element={<Main activeTab="seo-audit" />} />
        <Route path="/seo-pricing" element={<Main activeTab="seo-pricing" />} />
        <Route path="/seo-tools" element={<Main activeTab="seo-tools" />} />
        <Route path="/seo-contact" element={<Main activeTab="seo-contact" />} />
        <Route
          path="/leads-management"
          element={<Main activeTab="leads-management" />}
        />

        {/* ✅ Partner Auth & Dashboard */}
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

        {/* ✅ Dynamic Partner Public Page */}
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
