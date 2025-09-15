// SEO Mojo Embed Script
// This script can be embedded on any website to add the SEO Mojo widget
(function() {
  'use strict'

  // Configuration
  const CONFIG = {
    widgetUrl: 'http://localhost:3000/widget.html', // In production, this would be your CDN URL
    scriptVersion: '1.0.0',
    widgetId: 'seo-mojo-embed-widget'
  }

  // Check if widget is already loaded
  if (window.SEOMojoLoaded || document.getElementById(CONFIG.widgetId)) {
    return
  }
  window.SEOMojoLoaded = true

  // Load widget CSS
  function loadCSS() {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = CONFIG.widgetUrl.replace('.html', '.css')
    link.type = 'text/css'
    document.head.appendChild(link)
  }

  // Load widget HTML and JS
  function loadWidget() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', CONFIG.widgetUrl, true)
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText)
          } else {
            reject(new Error('Failed to load widget'))
          }
        }
      }
      xhr.send()
    })
  }

  // Load widget JavaScript
  function loadWidgetJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = CONFIG.widgetUrl.replace('.html', '.js')
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Initialize widget
  async function initWidget() {
    try {
      // Load CSS first
      loadCSS()

      // Load widget HTML
      const widgetHTML = await loadWidget()
      
      // Create widget container
      const widgetContainer = document.createElement('div')
      widgetContainer.innerHTML = widgetHTML
      
      // Append to body
      document.body.appendChild(widgetContainer)

      // Load widget JavaScript
      await loadWidgetJS()

      // Track widget installation
      trackEvent('widget_installed', {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        version: CONFIG.scriptVersion
      })

    } catch (error) {
      console.error('SEO Mojo Widget: Failed to load', error)
    }
  }

  // Track events
  function trackEvent(event, data) {
    // In a real implementation, you would send this to your analytics service
    console.log('SEO Mojo Event:', event, data)
    
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        custom_parameter: data
      })
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget)
  } else {
    initWidget()
  }

  // Expose global API
  window.SEOMojo = {
    version: CONFIG.scriptVersion,
    track: trackEvent,
    reload: initWidget
  }

})()
