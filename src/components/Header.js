import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Header.css";
import { useAlert } from "../utils/useAlert";

function Header({ tabs, partnerData }) {
  const { success, error, confirm } = useAlert();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Detect current route
  const firstSegment = location.pathname.split("/")[1] || "";

  // ✅ Known internal routes
  const knownRoutes = [
    "",
    "seo-audit",
    "seo-pricing",
    "seo-tools",
    "seo-contact",
    "leads-management",
    "login",
    "register",
    "partner-dashboard",
    "partner-settings",
    "partner-leads",
    "admin-dashboard",
    "admin-partners",
    "admin-leads",
    "admin-settings",
    "admin-users",
  ];

  const isPartnerPublic = firstSegment && !knownRoutes.includes(firstSegment);

  // ✅ Logo logic
  const defaultLogo = "/seo-logo.png";
  const partnerLogo = partnerData?.logo_url || defaultLogo;

  // ✅ Track auth state
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("userRole");
      setIsLoggedIn(!!token);
      setRole(storedRole);
    };
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  const handleLogout = async () => {
    const ok = await confirm("Are you sure you want to log out?");
    if (!ok) return;

    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    success("Logged out successfully!");
    navigate("/");
  };

  // ✅ Smart logo redirect
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isPartnerPublic) return;
    if (isLoggedIn && role === "admin") navigate("/admin-dashboard");
    else if (isLoggedIn && role === "partner") navigate("/partner-dashboard");
    else navigate("/seo-audit");
  };

  return (
    <header className="header-container">
      <div className="header-container-wrapper">
        {/* ✅ Logo */}
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img
            src={partnerLogo}
            alt={partnerData?.company_name || "SEO Mojo"}
            onError={(e) => (e.target.src = defaultLogo)}
          />
        </a>

        {/* ✅ Only hide header on partner public pages */}
        {!isPartnerPublic && (
          <div className="nav-group">
            <nav className="navbar-container">
              <button
                className={`menu-toggle ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
              >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </button>

              <ul className={`navbar-menu ${menuOpen ? "show" : ""}`}>
                {/* Public Tabs */}
                {!isLoggedIn &&
                  tabs.map((tab) => (
                    <li className="navbar-item" key={tab.id}>
                      <NavLink
                        to={`/${tab.id}`}
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={() => setMenuOpen(false)}
                      >
                        {tab.label}
                      </NavLink>
                    </li>
                  ))}

                {/* ✅ Partner Routes */}
                {isLoggedIn && role === "partner" && (
                  <>
                    <li className="navbar-item">
                      <NavLink to="/partner-dashboard">Dashboard</NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink to="/partner-settings">Settings</NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink to="/partner-leads">Leads Management</NavLink>
                    </li>
                  </>
                )}

                {/* ✅ Admin Routes */}
                {isLoggedIn && role === "admin" && (
                  <>
                    <li className="navbar-item">
                      <NavLink to="/admin-dashboard">Dashboard</NavLink>
                    </li>
                    {/*
                    <li className="navbar-item">
                      <NavLink to="/admin-settings">Settings</NavLink>
                    </li>
                    */}
                    <li className="navbar-item">
                      <NavLink to="/admin-users">Users</NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink to="/admin-partners">Partners</NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink to="/admin-leads">Lead Management</NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {/* ✅ Auth Button */}
            <div className="auth-controls">
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="partner-button"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              ) : (
                <button
                  className="partner-button logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
