import { useState } from "react";
import "../css/Header.css";

function Header({ tabs, activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false); // close mobile menu after selecting
  };

  return (
    <header className="header-container">
      <div className="header-container-wrapper">
        {/* Left: Logo */}
        <a href="/" className="logo">
          <img src="/seo-logo.png" alt="SEO Mojo Logo" />
        </a>

        {/* ✅ Right: Nav + Partner grouped together */}
        <div className="nav-group">
          {/* Navigation */}
          <nav className="navbar-container">
            {/* Mobile toggle */}
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
              {tabs.map((tab) => (
                <li className="navbar-item" key={tab.id}>
                  <button
                    className={activeTab === tab.id ? "active" : ""}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Partner Button */}
          <div className="partner-dropdown-container">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
              className="partner-button"
            >
              Partners ▾
            </button>

            {dropdownOpen && (
              <div className="partner-dropdown-menu">
                <a href="/partner-login" className="dropdown-item">
                  Login
                </a>
                <a href="/partner-register" className="dropdown-item">
                  Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
