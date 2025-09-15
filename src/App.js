import "./App.css";

function App() {
  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/seo-logo.png" alt="SEO Mojo Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="#">View Leads</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <h1>Run Your Free SEO Audit</h1>
        <div className="search-box">
          <input type="url" placeholder="Enter your website URL" />
          <button>Analyze SEO</button>
        </div>
      </main>

      <footer>
        <p>© 2025 SEO Mojo. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
