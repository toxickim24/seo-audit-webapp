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
  // ✅ Load partner theme and public/private state
  const { partnerData, isPartnerPublic, loading } = usePartnerTheme();

  // ✅ Helper: check login status
  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ Tabs for public navigation
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
        {/* ======================================================
           ✅ Public Pages
        ====================================================== */}
        <Route
          path="/seo-audit"
          element={
            isLoggedIn ? (
              <Navigate to="/partner-dashboard" replace />
            ) : (
              <Main activeTab="seo-audit" />
            )
          }
        />
        <Route path="/seo-pricing" element={<Main activeTab="seo-pricing" />} />
        <Route path="/seo-tools" element={<Main activeTab="seo-tools" />} />
        <Route path="/seo-contact" element={<Main activeTab="seo-contact" />} />
        <Route
          path="/leads-management"
          element={<Main activeTab="leads-management" />}
        />

        {/* ======================================================
           ✅ Partner Authentication & Dashboard
        ====================================================== */}
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
        <Route
          path="/partner-leads"
          element={
            <ProtectedRoute>
              <PartnerLeadsManagement />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
           ✅ Dynamic Public Partner Page (/:slug)
        ====================================================== */}
        <Route path="/:slug" element={<PublicPartnerPage />} />

        {/* ======================================================
           ✅ Default and Fallback Redirects
        ====================================================== */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/partner-dashboard" replace />
            ) : (
              <Navigate to="/seo-audit" replace />
            )
          }
        />

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
