import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "../css/Header.css";

function Header({ tabs }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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
        {/* === Logo === */}
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/seo-logo.png" alt="SEO Mojo Logo" />
        </Link>

        {/* === Navigation + Partner Area === */}
        <div className="nav-group">
          <nav className="navbar-container">
            {/* Mobile menu toggle */}
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
                </>
              )}
            </ul>
          </nav>

          {/* === Right-side buttons (Partners dropdown or Logout) === */}
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
      </div>
    </header>
  );
}

export default Header;
