import { useState } from "react";
import "../css/Header.css";

function Header({ tabs, activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false); // close menu after selecting
  };

  return (
    <header className="header-container">
      <div className="header-container-wrapper">
        {/* Logo */}
        <a href="/" className="logo">
          <img src="/seo-logo.png" alt="SEO Mojo Logo" />
        </a>

        {/* Nav */}
        <nav className="navbar-container">
          {/* Hamburger toggle (visible only on mobile via CSS) */}
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
      </div>
    </header>
  );
}

export default Header;
