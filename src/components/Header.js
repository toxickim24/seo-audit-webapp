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

  const handleMenuClose = () => setMenuOpen(false);

  // ----------------------------------------
  // DETECT PARTNER PUBLIC PAGE
  // ----------------------------------------
  const pathParts = location.pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0] || "";

  const knownRoutes = [
    "",
    "seo-audit",
    "seo-pricing",
    "seo-tools",
    "seo-how-it-works",
    "seo-contact",
    "resellers",
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

  const isPartnerPublic =
    firstSegment && !knownRoutes.includes(firstSegment);

  const partnerSlug = isPartnerPublic ? firstSegment : null;

  const isPartnerContactPage =
    isPartnerPublic && pathParts[1] === "contact";

  // ----------------------------------------
  // LOGO
  // ----------------------------------------
  const defaultLogo = "/seo-logo.png";
  const partnerLogo = partnerData?.logo_url || defaultLogo;

  const handleLogoClick = (e, isPartnerPublic, partnerSlug) => {
    // For public partner page, allow default behavior
    if (isPartnerPublic) return;

    e.preventDefault();

    if (isLoggedIn && role === "admin") {
      navigate("/admin-dashboard");
    } else if (isLoggedIn && role === "partner") {
      navigate("/partner-dashboard");
    } else {
      navigate("/seo-audit");
    }
  };

  // ----------------------------------------
  // AUTH STATE
  // ----------------------------------------
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

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (
        !e.target.closest(".navbar-container") &&
        !e.target.closest(".menu-toggle")
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [menuOpen]);

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------
  const handleLogout = async () => {
    const ok = await confirm("Are you sure you want to log out?");
    if (!ok) return;

    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    success("Logged out successfully!");
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="header-container">
      <div className="header-container-wrapper">
        
        {/* LOGO */}
        <a
          href={isPartnerPublic ? `/${partnerSlug}` : "/"}
          className="logo"
          onClick={(e) => handleLogoClick(e, isPartnerPublic, partnerSlug)}
        >
          <img
            src={partnerLogo}
            alt={partnerData?.company_name || "SEO Mojo"}
            onError={(e) => (e.target.src = defaultLogo)}
          />
        </a>

        {/* -------------------------------------------------
           HEADER FOR PUBLIC PARTNER PAGE (/:slug & /:slug/contact)
        --------------------------------------------------- */}
        {isPartnerPublic ? (
          <div className="nav-group">
            <nav className="navbar-container">
              <button
                className={`menu-toggle ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </button>

              <ul className={`navbar-menu ${menuOpen ? "show" : ""}`}>
                <li className="navbar-item">
                  <NavLink
                    to={`/${partnerSlug}`}
                    className={({ isActive }) => (isActive && !isPartnerContactPage ? "active" : "")}
                    onClick={handleMenuClose}
                  >
                    SEO Audit
                  </NavLink>
                </li>

                <li className="navbar-item">
                  <NavLink
                    to={`/${partnerSlug}/contact`}
                    className={({ isActive }) => (isPartnerContactPage ? "active" : "")}
                    onClick={handleMenuClose}
                  >
                    Contact
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        ) : (
          <>
            {/* -------------------------------------------------
               NORMAL HEADER (public pages, partner dashboard, admin)
            --------------------------------------------------- */}
            <div className="nav-group">
              <nav className="navbar-container">
                <button
                  className={`menu-toggle ${menuOpen ? "open" : ""}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span className="bar"></span>
                  <span className="bar"></span>
                  <span className="bar"></span>
                </button>

                <ul className={`navbar-menu ${menuOpen ? "show" : ""}`}>
                  {!isLoggedIn &&
                    tabs.map((tab) => (
                      <li className="navbar-item" key={tab.id}>
                        <NavLink
                          to={`/${tab.id}`}
                          onClick={handleMenuClose}
                          className={({ isActive }) => (isActive ? "active" : "")}
                        >
                          {tab.label}
                        </NavLink>
                      </li>
                    ))}

                  {isLoggedIn && role === "partner" && (
                    <>
                      <li className="navbar-item">
                        <NavLink to="/partner-dashboard" onClick={handleMenuClose}>
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="navbar-item">
                        <NavLink to="/partner-settings" onClick={handleMenuClose}>
                          Settings
                        </NavLink>
                      </li>
                      <li className="navbar-item">
                        <NavLink to="/partner-leads" onClick={handleMenuClose}>
                          Leads Management
                        </NavLink>
                      </li>
                    </>
                  )}

                  {isLoggedIn && role === "admin" && (
                    <>
                      <li className="navbar-item">
                        <NavLink to="/admin-dashboard" onClick={handleMenuClose}>
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="navbar-item">
                        <NavLink to="/admin-users" onClick={handleMenuClose}>
                          Users
                        </NavLink>
                      </li>
                      <li className="navbar-item">
                        <NavLink to="/admin-partners" onClick={handleMenuClose}>
                          Partners
                        </NavLink>
                      </li>
                      <li className="navbar-item">
                        <NavLink to="/admin-leads" onClick={handleMenuClose}>
                          Lead Management
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              {/* AUTH BUTTON */}
              <div className="auth-controls">
                {!isLoggedIn ? (
                  <Link to="/login" className="partner-button" onClick={handleMenuClose}>
                    Sign In
                  </Link>
                ) : (
                  <button className="partner-button logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;