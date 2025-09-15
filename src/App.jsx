import React, { useState, useEffect } from 'react'
import './App.css'
import SEOAuditTool from './components/SEOAuditTool'
import LeadCapture from './components/LeadCapture'
import PDFReport from './components/PDFReport'
import LeadDashboard from './components/LeadDashboard'
import Header from './components/Header'
import EmbedCodeModal from './components/EmbedCodeModal'

function App() {
  const [auditData, setAuditData] = useState(null)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [initialUrl, setInitialUrl] = useState('')

  // Handle URL parameters for Chrome extension and embeddable widget
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('url')
    const dashboard = urlParams.get('dashboard')
    const settings = urlParams.get('settings')

    if (url) {
      setInitialUrl(url)
    }

    if (dashboard === 'true') {
      setShowDashboard(true)
    }

    if (settings === 'true') {
      // Handle settings view if needed
      console.log('Settings view requested')
    }
  }, [])

  const handleAuditComplete = (data) => {
    setAuditData(data)
    setShowLeadCapture(true)
  }

  const handleLeadSubmit = (leadData) => {
    setUserInfo(leadData)
    setShowLeadCapture(false)
    setShowReport(true)
  }

  const resetAudit = () => {
    setAuditData(null)
    setShowLeadCapture(false)
    setUserInfo(null)
    setShowReport(false)
    setShowDashboard(false)
    setShowEmbedModal(false)
  }

  const showLeadDashboard = () => {
    setShowDashboard(true)
  }

  return (
    <div className="app">
      <Header 
        onShowDashboard={showLeadDashboard} 
        onShowEmbed={() => setShowEmbedModal(true)}
      />

      <main className="main-content">
        {showDashboard && (
          <LeadDashboard onBack={resetAudit} />
        )}

        {!showDashboard && !auditData && !showLeadCapture && !showReport && (
          <SEOAuditTool 
            onAuditComplete={handleAuditComplete} 
            initialUrl={initialUrl}
          />
        )}

        {!showDashboard && showLeadCapture && auditData && (
          <LeadCapture
            auditData={auditData}
            onLeadSubmit={handleLeadSubmit}
            onBack={resetAudit}
          />
        )}

        {!showDashboard && showReport && auditData && userInfo && (
          <PDFReport
            auditData={auditData}
            userInfo={userInfo}
            onNewAudit={resetAudit}
          />
        )}
      </main>

      <EmbedCodeModal 
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
      />
    </div>
  )
}

export default App
