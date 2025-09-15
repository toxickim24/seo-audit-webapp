// SEO Mojo Embeddable Widget JavaScript
(function() {
  'use strict'

  // Configuration
  const CONFIG = {
    seoMojoUrl: window.location.origin, // Use current origin
    widgetId: 'seo-mojo-embed-widget',
    version: '1.0.0'
  }

  // Widget state
  let isCollapsed = false
  let isAnalyzing = false

  // Initialize widget
  function init() {
    const widget = document.getElementById(CONFIG.widgetId)
    if (!widget) return

    // Set current URL
    updateCurrentUrl()
    
    // Add event listeners
    addEventListeners()
    
    // Auto-collapse after 10 seconds if no interaction
    setTimeout(() => {
      if (!isCollapsed) {
        toggleWidget()
      }
    }, 10000)
  }

  // Update current URL display
  function updateCurrentUrl() {
    const urlElement = document.getElementById('current-site-url')
    if (urlElement) {
      urlElement.textContent = window.location.href
    }
  }

  // Add event listeners
  function addEventListeners() {
    const toggleBtn = document.getElementById('widget-toggle')
    const analyzeBtn = document.getElementById('analyze-btn')
    const quickBtn = document.getElementById('quick-btn')
    const header = document.querySelector('.widget-header')

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleWidget)
    }

    if (header) {
      header.addEventListener('click', toggleWidget)
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', handleFullAnalysis)
    }

    if (quickBtn) {
      quickBtn.addEventListener('click', handleQuickAnalysis)
    }
  }

  // Toggle widget collapse/expand
  function toggleWidget() {
    const container = document.querySelector('.widget-container')
    const toggleIcon = document.querySelector('.toggle-icon')
    
    if (!container || !toggleIcon) return

    isCollapsed = !isCollapsed
    
    if (isCollapsed) {
      container.classList.add('collapsed')
      toggleIcon.textContent = '+'
    } else {
      container.classList.remove('collapsed')
      toggleIcon.textContent = '−'
    }
  }

  // Handle full analysis
  function handleFullAnalysis() {
    if (isAnalyzing) return

    const analyzeBtn = document.getElementById('analyze-btn')
    if (!analyzeBtn) return

    // Show loading state
    isAnalyzing = true
    analyzeBtn.disabled = true
    analyzeBtn.innerHTML = '<span class="loading"></span> Analyzing...'

    // Open SEO Mojo app in new tab
    const url = `${CONFIG.seoMojoUrl}?url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')

    // Reset button after delay
    setTimeout(() => {
      isAnalyzing = false
      analyzeBtn.disabled = false
      analyzeBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Run SEO Audit</span>'
    }, 2000)
  }

  // Handle quick analysis
  function handleQuickAnalysis() {
    if (isAnalyzing) return

    const quickBtn = document.getElementById('quick-btn')
    if (!quickBtn) return

    // Show loading state
    isAnalyzing = true
    quickBtn.disabled = true
    quickBtn.innerHTML = '<span class="loading"></span> Checking...'

    // Run quick analysis
    setTimeout(() => {
      const results = runQuickAnalysis()
      showQuickResults(results)
      
      // Reset button
      isAnalyzing = false
      quickBtn.disabled = false
      quickBtn.innerHTML = '<span class="btn-icon">⚡</span><span class="btn-text">Quick Check</span>'
    }, 1500)
  }

  // Run quick analysis
  function runQuickAnalysis() {
    const results = {
      url: window.location.href,
      title: document.title,
      description: getMetaDescription(),
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      h3Count: document.querySelectorAll('h3').length,
      imageCount: document.querySelectorAll('img').length,
      imageAltCount: document.querySelectorAll('img[alt]').length,
      linkCount: document.querySelectorAll('a').length,
      hasHttps: window.location.protocol === 'https:',
      hasCanonical: !!document.querySelector('link[rel="canonical"]'),
      hasRobots: !!document.querySelector('meta[name="robots"]'),
      hasViewport: !!document.querySelector('meta[name="viewport"]'),
      timestamp: new Date().toISOString()
    }

    return results
  }

  // Get meta description
  function getMetaDescription() {
    const meta = document.querySelector('meta[name="description"]')
    return meta ? meta.content : null
  }

  // Show quick analysis results
  function showQuickResults(results) {
    const widgetBody = document.querySelector('.widget-body')
    if (!widgetBody) return

    // Create results HTML
    const resultsHTML = `
      <div class="quick-results">
        <h4>⚡ Quick Analysis Results</h4>
        <div class="results-grid">
          <div class="result-item">
            <span class="result-label">Title Length:</span>
            <span class="result-value">${results.title.length} chars</span>
          </div>
          <div class="result-item">
            <span class="result-label">Meta Description:</span>
            <span class="result-value">${results.description ? 'Present' : 'Missing'}</span>
          </div>
          <div class="result-item">
            <span class="result-label">H1 Tags:</span>
            <span class="result-value">${results.h1Count}</span>
          </div>
          <div class="result-item">
            <span class="result-label">H2 Tags:</span>
            <span class="result-value">${results.h2Count}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Images with Alt:</span>
            <span class="result-value">${results.imageAltCount}/${results.imageCount}</span>
          </div>
          <div class="result-item">
            <span class="result-label">HTTPS:</span>
            <span class="result-value">${results.hasHttps ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Canonical:</span>
            <span class="result-value">${results.hasCanonical ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Viewport:</span>
            <span class="result-value">${results.hasViewport ? '✅ Yes' : '❌ No'}</span>
          </div>
        </div>
        <div class="widget-actions">
          <button class="analyze-btn" id="analyze-btn">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">Run Full Analysis</span>
          </button>
          <button class="quick-btn" id="back-btn">
            <span class="btn-icon">←</span>
            <span class="btn-text">Back</span>
          </button>
        </div>
      </div>
    `

    // Store original content
    if (!widgetBody.dataset.originalContent) {
      widgetBody.dataset.originalContent = widgetBody.innerHTML
    }

    // Show results
    widgetBody.innerHTML = resultsHTML

    // Add event listeners for new buttons
    const analyzeBtn = document.getElementById('analyze-btn')
    const backBtn = document.getElementById('back-btn')

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', handleFullAnalysis)
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Restore original content
        widgetBody.innerHTML = widgetBody.dataset.originalContent
        addEventListeners()
      })
    }
  }

  // Track widget usage
  function trackUsage(action) {
    // In a real implementation, you would send this to your analytics service
    console.log('SEO Mojo Widget:', action, {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      version: CONFIG.version
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Track widget load
  trackUsage('widget_loaded')

  // Expose widget API globally
  window.SEOMojoWidget = {
    version: CONFIG.version,
    analyze: handleFullAnalysis,
    quickCheck: handleQuickAnalysis,
    toggle: toggleWidget,
    track: trackUsage
  }

})()
