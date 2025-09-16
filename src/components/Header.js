import "../css/Header.css";

function Header({ tabs, activeTab, setActiveTab }) {
  return (
    <header className="header-container">
        <div className="header-container-wrapper">
            <a href="/" className="logo">
                <img src="/seo-logo.png" alt="SEO Mojo Logo" />
            </a>

            <nav className="navbar-container">
                <ul className="navbar-menu">
                {tabs.map((tab) => (
                    <li className="navbar-item" key={tab.id}>
                        <button className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
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
