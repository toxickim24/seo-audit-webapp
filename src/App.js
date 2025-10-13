import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PartnerDashboard from "./pages/Dashboard/PartnerDashboard";
import PartnerSettings from "./pages/Dashboard/PartnerSettings";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import PublicPartnerPage from "./pages/PublicPartnerPage/PublicPartnerPage";
import "./App.css";

function App() {
  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "seo-pricing", label: "Pricing" },
    { id: "seo-tools", label: "Tools" },
    { id: "seo-contact", label: "Contact" },
    { id: "leads-management", label: "Lead Management" },
  ];

  return (
    <Router>
      <Header tabs={tabs} />
      <Routes>
        {/* Public SEO tabs */}
        <Route path="/" element={<Navigate to="/seo-audit" replace />} />
        <Route path="/seo-audit" element={<Main activeTab="seo-audit" />} />
        <Route path="/seo-pricing" element={<Main activeTab="seo-pricing" />} />
        <Route path="/seo-tools" element={<Main activeTab="seo-tools" />} />
        <Route path="/seo-contact" element={<Main activeTab="seo-contact" />} />
        <Route path="/leads-management" element={<Main activeTab="leads-management" />} />

        {/* Partner routes */}
        <Route path="/partner-login" element={<Login />} />
        <Route path="/partner-register" element={<Register />} />

        {/* Protected dashboard */}
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

        {/* Public partner page (toggleable) */}
        <Route path="/:slug" element={<PublicPartnerPage />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/seo-audit" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
