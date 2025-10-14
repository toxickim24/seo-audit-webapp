import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Header.css";

function Header({ tabs, partnerData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const firstSegment = location.pathname.split("/")[1] || "";
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

  const isPartnerPublic = firstSegment && !knownRoutes.includes(firstSegment);

  const defaultLogo = "/seo-logo.png";
  const partnerLogo = partnerData?.logo_url || defaultLogo;

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  // ✅ Smart logo click behavior
  const handleLogoClick = (e) => {
    e.preventDefault();

    if (isPartnerPublic) {
      // Stay on partner link
      return;
    }

    if (isLoggedIn) {
      navigate("/partner-dashboard");
    } else {
      navigate("/seo-audit");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".partner-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="header-container">
      <div className="header-container-wrapper">
        {/* ✅ Logo with smart redirect */}
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img
            src={partnerLogo}
            alt={partnerData?.company_name || "SEO Mojo"}
            onError={(e) => (e.target.src = defaultLogo)}
          />
        </a>

        {/* ✅ Hide everything else when on partner link */}
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

                {isLoggedIn && (
                  <>
                    <li className="navbar-item">
                      <NavLink
                        to="/partner-dashboard"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink
                        to="/partner-settings"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </NavLink>
                    </li>
                    <li className="navbar-item">
                      <NavLink
                        to="/partner-leads"
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={() => setMenuOpen(false)}
                      >
                        Lead Management
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div className="auth-controls">
              {!isLoggedIn ? (
                <div className="partner-dropdown-container">
                  <button
                    className="partner-button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    Partners ▾
                  </button>

                  <div
                    className={`partner-dropdown-menu ${
                      dropdownOpen ? "show" : ""
                    }`}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link
                      to="/partner-login"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/partner-register"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              ) : (
                <button className="partner-button logout-btn" onClick={handleLogout}>
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
