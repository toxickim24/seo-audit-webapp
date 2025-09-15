// Chrome Extension Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const currentUrlElement = document.getElementById('current-url')
  const analyzeBtn = document.getElementById('analyze-btn')
  const openWidgetBtn = document.getElementById('open-widget-btn')
  const viewLeadsBtn = document.getElementById('view-leads-btn')
  const settingsBtn = document.getElementById('settings-btn')
  const recentAuditsList = document.getElementById('recent-audits-list')

  // Get current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.url) {
      currentUrlElement.textContent = tab.url
    } else {
      currentUrlElement.textContent = 'No active tab'
      analyzeBtn.disabled = true
    }
  } catch (error) {
    console.error('Error getting current tab:', error)
    currentUrlElement.textContent = 'Error loading URL'
    analyzeBtn.disabled = true
  }

  // Load recent audits
  loadRecentAudits()

  // Event listeners
  analyzeBtn.addEventListener('click', handleAnalyze)
  openWidgetBtn.addEventListener('click', handleOpenWidget)
  viewLeadsBtn.addEventListener('click', handleViewLeads)
  settingsBtn.addEventListener('click', handleSettings)

  async function handleAnalyze() {
    try {
      analyzeBtn.disabled = true
      analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...'

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab || !tab.url) {
        throw new Error('No active tab found')
      }

      // Open the main SEO Mojo app with the current URL
      const seoMojoUrl = `http://localhost:3000/?url=${encodeURIComponent(tab.url)}`
      await chrome.tabs.create({ url: seoMojoUrl })

      // Close popup
      window.close()
    } catch (error) {
      console.error('Error analyzing site:', error)
      alert('Error analyzing site: ' + error.message)
    } finally {
      analyzeBtn.disabled = false
      analyzeBtn.innerHTML = '🚀 Analyze This Site'
    }
  }

  async function handleOpenWidget() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab || !tab.url) {
        throw new Error('No active tab found')
      }

      // Inject the widget into the current page
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injectWidget
      })

      // Close popup
      window.close()
    } catch (error) {
      console.error('Error opening widget:', error)
      alert('Error opening widget: ' + error.message)
    }
  }

  async function handleViewLeads() {
    try {
      // Open the lead dashboard
      await chrome.tabs.create({ url: 'http://localhost:3000/?dashboard=true' })
      window.close()
    } catch (error) {
      console.error('Error opening leads:', error)
      alert('Error opening leads: ' + error.message)
    }
  }

  async function handleSettings() {
    try {
      // Open settings page
      await chrome.tabs.create({ url: 'http://localhost:3000/?settings=true' })
      window.close()
    } catch (error) {
      console.error('Error opening settings:', error)
      alert('Error opening settings: ' + error.message)
    }
  }

  async function loadRecentAudits() {
    try {
      const result = await chrome.storage.local.get(['recentAudits'])
      const audits = result.recentAudits || []

      if (audits.length === 0) {
        recentAuditsList.innerHTML = '<p class="no-audits">No recent audits</p>'
        return
      }

      recentAuditsList.innerHTML = audits
        .slice(0, 5) // Show only last 5 audits
        .map(audit => `
          <div class="audit-item">
            <div class="audit-url">${audit.url}</div>
            <div class="audit-score">${audit.score}</div>
          </div>
        `).join('')
    } catch (error) {
      console.error('Error loading recent audits:', error)
      recentAuditsList.innerHTML = '<p class="no-audits">Error loading audits</p>'
    }
  }
})

// Function to inject widget (executed in content script context)
function injectWidget() {
  // Check if widget is already injected
  if (document.getElementById('seo-mojo-widget')) {
    return
  }

  // Create widget container
  const widgetContainer = document.createElement('div')
  widgetContainer.id = 'seo-mojo-widget'
  widgetContainer.innerHTML = `
    <div class="seo-mojo-widget-overlay">
      <div class="seo-mojo-widget-content">
        <div class="widget-header">
          <h3>🔍 SEO Mojo</h3>
          <button class="widget-close">×</button>
        </div>
        <div class="widget-body">
          <p>Analyzing: <strong>${window.location.href}</strong></p>
          <button class="widget-analyze-btn">🚀 Run SEO Audit</button>
        </div>
      </div>
    </div>
  `

  // Add widget styles
  const style = document.createElement('style')
  style.textContent = `
    #seo-mojo-widget {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .seo-mojo-widget-content {
      background: white;
      border-radius: 12px;
      padding: 20px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .widget-header h3 {
      margin: 0;
      color: #2c3e50;
    }
    
    .widget-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #7f8c8d;
    }
    
    .widget-body p {
      margin-bottom: 15px;
      color: #7f8c8d;
    }
    
    .widget-analyze-btn {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(widgetContainer)

  // Add event listeners
  widgetContainer.querySelector('.widget-close').addEventListener('click', () => {
    widgetContainer.remove()
  })

  widgetContainer.querySelector('.widget-analyze-btn').addEventListener('click', () => {
    window.open(`http://localhost:3000/?url=${encodeURIComponent(window.location.href)}`, '_blank')
    widgetContainer.remove()
  })

  // Close on overlay click
  widgetContainer.addEventListener('click', (e) => {
    if (e.target === widgetContainer) {
      widgetContainer.remove()
    }
  })
}
