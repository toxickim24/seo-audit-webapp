// Chrome Extension Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('SEO Mojo extension installed')
  
  // Set up default storage
  chrome.storage.local.set({
    recentAudits: [],
    settings: {
      autoAnalyze: false,
      showNotifications: true,
      theme: 'light'
    }
  })
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveAudit') {
    saveAudit(request.data)
    sendResponse({ success: true })
  } else if (request.action === 'getRecentAudits') {
    getRecentAudits().then(sendResponse)
  } else if (request.action === 'openSEOApp') {
    chrome.tabs.create({ url: request.url })
    sendResponse({ success: true })
  }
  
  return true // Keep message channel open for async response
})

// Save audit results
async function saveAudit(auditData) {
  try {
    const result = await chrome.storage.local.get(['recentAudits'])
    const audits = result.recentAudits || []
    
    // Add new audit to the beginning
    audits.unshift({
      ...auditData,
      timestamp: Date.now()
    })
    
    // Keep only last 10 audits
    const recentAudits = audits.slice(0, 10)
    
    await chrome.storage.local.set({ recentAudits })
    
    // Show notification if enabled
    const settings = await chrome.storage.local.get(['settings'])
    if (settings.settings?.showNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'SEO Mojo',
        message: `Audit completed for ${auditData.url} - Score: ${auditData.score}`
      })
    }
  } catch (error) {
    console.error('Error saving audit:', error)
  }
}

// Get recent audits
async function getRecentAudits() {
  try {
    const result = await chrome.storage.local.get(['recentAudits'])
    return result.recentAudits || []
  } catch (error) {
    console.error('Error getting recent audits:', error)
    return []
  }
}

// Handle tab updates for auto-analysis
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const settings = await chrome.storage.local.get(['settings'])
    
    if (settings.settings?.autoAnalyze && tab.url.startsWith('http')) {
      // Auto-analyze the page
      chrome.scripting.executeScript({
        target: { tabId },
        function: autoAnalyzePage
      })
    }
  }
})

// Auto-analyze function (executed in content script context)
function autoAnalyzePage() {
  // This would contain the actual SEO analysis logic
  // For now, just show a notification
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('SEO Mojo: Auto-analyzing page:', window.location.href)
    
    // You could inject a small analysis widget here
    // or send data back to the background script
  }
}
