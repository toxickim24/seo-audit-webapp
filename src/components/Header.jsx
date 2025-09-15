import React from 'react'

function Header({ onShowDashboard, onShowEmbed }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🚀 SEO Mojo</h1>
          <p>Professional SEO Audit Tool</p>
        </div>
        <nav className="nav">
          <a href="#audit">SEO Audit</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          {onShowEmbed && (
            <button 
              onClick={onShowEmbed}
              className="embed-nav-btn"
            >
              🔗 Embed
            </button>
          )}
          {onShowDashboard && (
            <button 
              onClick={onShowDashboard}
              className="dashboard-btn"
            >
              📊 View Leads
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
