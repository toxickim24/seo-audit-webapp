// Chrome Extension Content Script
(function() {
  'use strict'

  // Check if SEO Mojo widget is already loaded
  if (window.seoMojoLoaded) {
    return
  }
  window.seoMojoLoaded = true

  // Add SEO Mojo button to page
  function addSEOButton() {
    // Check if button already exists
    if (document.getElementById('seo-mojo-float-btn')) {
      return
    }

    const button = document.createElement('div')
    button.id = 'seo-mojo-float-btn'
    button.innerHTML = `
      <div class="seo-mojo-button">
        <span class="seo-mojo-icon">🔍</span>
        <span class="seo-mojo-text">SEO Mojo</span>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #seo-mojo-float-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        cursor: pointer;
        user-select: none;
      }
      
      .seo-mojo-button {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
      }
      
      .seo-mojo-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
      }
      
      .seo-mojo-icon {
        font-size: 16px;
      }
      
      .seo-mojo-text {
        white-space: nowrap;
      }
      
      @media (max-width: 768px) {
        .seo-mojo-text {
          display: none;
        }
        
        .seo-mojo-button {
          padding: 12px;
          border-radius: 50%;
        }
      }
    `

    document.head.appendChild(style)
    document.body.appendChild(button)

    // Add click event
    button.addEventListener('click', () => {
      openSEOWidget()
    })
  }

  // Open SEO widget
  function openSEOWidget() {
    // Check if widget is already open
    if (document.getElementById('seo-mojo-widget')) {
      return
    }

    const widget = document.createElement('div')
    widget.id = 'seo-mojo-widget'
    widget.innerHTML = `
      <div class="seo-mojo-widget-overlay">
        <div class="seo-mojo-widget-content">
          <div class="widget-header">
            <h3>🔍 SEO Mojo</h3>
            <button class="widget-close">×</button>
          </div>
          <div class="widget-body">
            <div class="current-site-info">
              <p><strong>Current Site:</strong></p>
              <p class="site-url">${window.location.href}</p>
            </div>
            <div class="widget-actions">
              <button class="widget-analyze-btn">
                🚀 Run Full SEO Audit
              </button>
              <button class="widget-quick-btn">
                ⚡ Quick Analysis
              </button>
            </div>
            <div class="widget-features">
              <h4>What you'll get:</h4>
              <ul>
                <li>✅ On-page SEO analysis</li>
                <li>✅ Technical SEO audit</li>
                <li>✅ Performance metrics</li>
                <li>✅ PDF report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `

    // Add widget styles
    const widgetStyle = document.createElement('style')
    widgetStyle.textContent = `
      .seo-mojo-widget-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.3s ease;
      }
      
      .seo-mojo-widget-content {
        background: white;
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }
      
      .widget-header {
        background: linear-gradient(135deg, #2c3e50, #34495e);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .widget-header h3 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .widget-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s;
      }
      
      .widget-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .widget-body {
        padding: 20px;
      }
      
      .current-site-info {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #3498db;
      }
      
      .current-site-info p {
        margin: 0 0 5px 0;
        color: #2c3e50;
      }
      
      .site-url {
        font-size: 0.9rem;
        color: #7f8c8d;
        word-break: break-all;
      }
      
      .widget-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .widget-analyze-btn,
      .widget-quick-btn {
        flex: 1;
        padding: 12px 16px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }
      
      .widget-analyze-btn {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
      }
      
      .widget-analyze-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      }
      
      .widget-quick-btn {
        background: #f8f9fa;
        color: #2c3e50;
        border: 2px solid #e9ecef;
      }
      
      .widget-quick-btn:hover {
        border-color: #3498db;
        color: #3498db;
      }
      
      .widget-features h4 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 1rem;
      }
      
      .widget-features ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .widget-features li {
        padding: 5px 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @media (max-width: 768px) {
        .widget-actions {
          flex-direction: column;
        }
        
        .seo-mojo-widget-content {
          margin: 20px;
          width: calc(100% - 40px);
        }
      }
    `

    document.head.appendChild(widgetStyle)
    document.body.appendChild(widget)

    // Add event listeners
    widget.querySelector('.widget-close').addEventListener('click', () => {
      widget.remove()
    })

    widget.querySelector('.widget-analyze-btn').addEventListener('click', () => {
      window.open(`http://localhost:3000/?url=${encodeURIComponent(window.location.href)}`, '_blank')
      widget.remove()
    })

    widget.querySelector('.widget-quick-btn').addEventListener('click', () => {
      runQuickAnalysis()
    })

    // Close on overlay click
    widget.addEventListener('click', (e) => {
      if (e.target === widget.querySelector('.seo-mojo-widget-overlay')) {
        widget.remove()
      }
    })
  }

  // Run quick analysis
  function runQuickAnalysis() {
    const quickResults = {
      url: window.location.href,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || 'No description',
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      imageCount: document.querySelectorAll('img').length,
      imageAltCount: document.querySelectorAll('img[alt]').length,
      linkCount: document.querySelectorAll('a').length,
      hasHttps: window.location.protocol === 'https:',
      timestamp: new Date().toISOString()
    }

    // Show quick results
    showQuickResults(quickResults)
  }

  // Show quick analysis results
  function showQuickResults(results) {
    const widget = document.getElementById('seo-mojo-widget')
    if (!widget) return

    const widgetBody = widget.querySelector('.widget-body')
    widgetBody.innerHTML = `
      <div class="quick-results">
        <h4>⚡ Quick Analysis Results</h4>
        <div class="results-grid">
          <div class="result-item">
            <span class="result-label">Title:</span>
            <span class="result-value">${results.title.length > 50 ? results.title.substring(0, 50) + '...' : results.title}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Description:</span>
            <span class="result-value">${results.description ? 'Present' : 'Missing'}</span>
          </div>
          <div class="result-item">
            <span class="result-label">H1 Tags:</span>
            <span class="result-value">${results.h1Count}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Images:</span>
            <span class="result-value">${results.imageAltCount}/${results.imageCount} with alt</span>
          </div>
          <div class="result-item">
            <span class="result-label">HTTPS:</span>
            <span class="result-value">${results.hasHttps ? '✅ Yes' : '❌ No'}</span>
          </div>
        </div>
        <div class="quick-actions">
          <button class="widget-analyze-btn">
            🚀 Run Full Analysis
          </button>
          <button class="widget-back-btn">
            ← Back
          </button>
        </div>
      </div>
    `

    // Add quick results styles
    const quickStyle = document.createElement('style')
    quickStyle.textContent = `
      .quick-results h4 {
        color: #2c3e50;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .results-grid {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #3498db;
      }
      
      .result-label {
        font-weight: 600;
        color: #2c3e50;
      }
      
      .result-value {
        color: #7f8c8d;
        font-size: 0.9rem;
      }
      
      .quick-actions {
        display: flex;
        gap: 10px;
      }
      
      .widget-back-btn {
        background: #f8f9fa;
        color: #2c3e50;
        border: 2px solid #e9ecef;
        padding: 12px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        flex: 1;
      }
      
      .widget-back-btn:hover {
        border-color: #3498db;
        color: #3498db;
      }
    `

    document.head.appendChild(quickStyle)

    // Add event listeners
    widget.querySelector('.widget-analyze-btn').addEventListener('click', () => {
      window.open(`http://localhost:3000/?url=${encodeURIComponent(window.location.href)}`, '_blank')
      widget.remove()
    })

    widget.querySelector('.widget-back-btn').addEventListener('click', () => {
      // Restore original widget content
      openSEOWidget()
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSEOButton)
  } else {
    addSEOButton()
  }

  // Re-add button if page content changes (SPA navigation)
  const observer = new MutationObserver(() => {
    if (!document.getElementById('seo-mojo-float-btn')) {
      addSEOButton()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})()
